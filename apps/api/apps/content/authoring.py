"""
Статьи специалистов и их модерация.

Специалист (/pro/articles) пишет статью: Markdown, тема, описание, источники (по желанию), обложка.
Статусы (Article.moderation): черновик → на модерации → опубликована / отклонена (с комментарием).
Публикует только сотрудник с правом content.publish (/admin/content, очередь «От специалистов»).

    /api/v1/content/my/articles/                    GET, POST            — мои статьи
    /api/v1/content/my/articles/<id>/               GET, PATCH, DELETE   — черновик/отклонённую можно править
    /api/v1/content/my/articles/<id>/submit/        POST                 — отправить на модерацию
    /api/v1/content/my/articles/<id>/withdraw/      POST                 — вернуть в черновики (и снять с публикации)
    /api/v1/content/covers/                         POST (multipart)     — загрузить обложку (сотрудник или специалист)
    /api/v1/content/manage/articles/<id>/moderate/  POST {decision, comment}  — content.publish
    /api/v1/content/manage/articles/<id>/feature/   POST {featured}           — content.publish
    /api/v1/content/articles/<slug>/read/           POST                 — +1 прочтение (анонимно)
"""
import json
import re
import uuid

from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView

from apps.users.permissions import IsPsychologist

from .covers import CoverError, process_cover
from .models import Article, ArticleCover, Moderation
from .permissions import can_manage_content
from .serializers import ArticleManageSerializer, CoverImageMixin, _topic_label, clean_sources

M = Moderation

_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z", "и": "i",
    "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t",
    "у": "u", "ф": "f", "х": "h", "ц": "c", "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "",
    "э": "e", "ю": "yu", "я": "ya",
}


def unique_slug(title: str) -> str:
    base = "".join(_TRANSLIT.get(ch, ch) for ch in (title or "").lower())
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:80].strip("-") or "statya"
    slug = base
    while Article.objects.filter(slug=slug).exists():
        slug = f"{base}-{uuid.uuid4().hex[:5]}"
    return slug


def estimate_minutes(body: str) -> int:
    return max(1, min(90, round(len((body or "").split()) / 160)))


def can_publish(user) -> bool:
    if not (user and user.is_authenticated):
        return False
    try:
        from apps.staff.roles import has_staff_perm
    except ImportError:  # pragma: no cover
        return can_manage_content(user)
    return has_staff_perm(user, "content.publish")


class CanPublishContent(BasePermission):
    message = "Публиковать материалы могут только сотрудники с правом на публикацию."

    def has_permission(self, request, view):
        return can_publish(request.user)


def _audit(request, action, article, details=None):
    try:
        from apps.staff.audit import audit
    except ImportError:  # pragma: no cover
        return
    audit(request, action, target=("article", article.pk, article.title), details=details or {})


# ── Обложки ─────────────────────────────────────────────────────────────────

class CoverThrottle(UserRateThrottle):
    rate = "40/hour"
    scope = "article_cover"


class CanUploadCover(BasePermission):
    message = "Загружать обложки могут редакция и специалисты."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return can_manage_content(user) or hasattr(user, "psychologist_profile")


class CoverUploadView(APIView):
    """multipart: image, crop? ({"x","y","w"} — доли исходника). → {id, url, md, sm, width, height}"""

    permission_classes = [CanUploadCover]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [CoverThrottle]

    def post(self, request):
        crop = request.data.get("crop")
        if crop:
            try:
                crop = json.loads(crop) if isinstance(crop, str) else crop
                if not isinstance(crop, dict):
                    raise ValueError
            except ValueError:
                return Response({"detail": "Неверные параметры кадрирования."}, status=400)
        try:
            files = process_cover(request.FILES.get("image"), crop or None)
        except CoverError as exc:
            return Response({"detail": str(exc)}, status=400)
        cover = ArticleCover(uploaded_by=request.user, width=files["width"], height=files["height"])
        for field in ("image", "image_md", "image_sm"):
            getattr(cover, field).save(files[field].name, files[field], save=False)
        cover.save()
        return Response(cover.as_json(), status=status.HTTP_201_CREATED)


# ── Кабинет специалиста ─────────────────────────────────────────────────────

class MyArticleSerializer(CoverImageMixin, serializers.ModelSerializer):
    own_covers_only = True
    topic_label = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    status = serializers.CharField(source="moderation", read_only=True)

    class Meta:
        model = Article
        fields = (
            "id", "slug", "title", "summary", "body", "topic", "topic_label", "sources", "cover", "cover_image",
            "cover_image_id", "reading_minutes", "status", "moderation_comment", "submitted_at", "moderated_at",
            "published_at", "is_published", "is_featured", "reads", "created_at", "updated_at",
        )
        read_only_fields = (
            "slug", "reading_minutes", "moderation_comment", "submitted_at", "moderated_at", "published_at",
            "is_published", "is_featured", "reads", "created_at", "updated_at", "cover",
        )
        extra_kwargs = {"title": {"max_length": 200}, "body": {"required": False, "allow_blank": True}}

    def get_topic_label(self, obj):
        return _topic_label(obj.topic)

    def get_cover_image(self, obj):
        return obj.cover_image.as_json() if obj.cover_image_id and obj.cover_image else None

    def validate_title(self, value):
        value = " ".join((value or "").split())
        if len(value) < 3:
            raise serializers.ValidationError("Заголовок — хотя бы несколько слов.")
        return value

    def validate_body(self, value):
        if len(value or "") > 60_000:
            raise serializers.ValidationError("Текст слишком длинный: до 60 000 знаков.")
        return value

    def validate_sources(self, value):
        return clean_sources(value)

    def validate(self, attrs):
        if self.instance is not None and self.instance.moderation not in (M.DRAFT, M.REJECTED):
            raise serializers.ValidationError(
                {"detail": "Статья на модерации или опубликована. Верните её в черновики, чтобы изменить."})
        return attrs

    def create(self, validated_data):
        profile = self.context["request"].user.psychologist_profile
        validated_data.update(
            specialist=profile, author_name=profile.display_name, moderation=M.DRAFT, is_published=False,
            slug=unique_slug(validated_data.get("title", "")),
            reading_minutes=estimate_minutes(validated_data.get("body", "")),
        )
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "body" in validated_data:
            validated_data["reading_minutes"] = estimate_minutes(validated_data["body"])
        return super().update(instance, validated_data)


def _my_articles(request):
    return Article.objects.filter(specialist__user=request.user).select_related("cover_image")


class MyArticleListView(generics.ListCreateAPIView):
    permission_classes = [IsPsychologist]
    serializer_class = MyArticleSerializer

    def get_queryset(self):
        return _my_articles(self.request).order_by("-updated_at")


class MyArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsPsychologist]
    serializer_class = MyArticleSerializer
    http_method_names = ["get", "patch", "delete"]

    def get_queryset(self):
        return _my_articles(self.request)

    def perform_destroy(self, instance):
        cover = instance.cover_image
        instance.delete()
        if cover is not None and not Article.objects.filter(cover_image=cover).exists():
            cover.delete_files()
            cover.delete()


MIN_WORDS = 150


class MyArticleSubmitView(APIView):
    permission_classes = [IsPsychologist]

    def post(self, request, pk):
        article = _my_articles(request).filter(pk=pk).first()
        if article is None:
            return Response({"detail": "Статья не найдена."}, status=404)
        profile = request.user.psychologist_profile
        if profile.verification_status != profile.VerificationStatus.APPROVED:
            return Response({"detail": "Отправлять статьи можно после проверки профиля."}, status=403)
        if article.moderation not in (M.DRAFT, M.REJECTED):
            return Response({"detail": "Статья уже на модерации или опубликована."}, status=400)
        errors = {}
        if len(article.title.strip()) < 3:
            errors["title"] = ["Добавьте заголовок."]
        if len(article.summary.strip()) < 20:
            errors["summary"] = ["Добавьте короткое описание: 1–2 предложения."]
        if len(article.body.split()) < MIN_WORDS:
            errors["body"] = [f"Текст слишком короткий: нужно хотя бы {MIN_WORDS} слов."]
        if errors:
            return Response(errors, status=400)
        article.moderation = M.PENDING
        article.submitted_at = timezone.now()
        article.author_name = profile.display_name
        article.save(update_fields=["moderation", "submitted_at", "author_name", "updated_at"])
        return Response(MyArticleSerializer(article, context={"request": request}).data)


class MyArticleWithdrawView(APIView):
    """На модерации → черновик; опубликованная → снимается с публикации и становится черновиком."""

    permission_classes = [IsPsychologist]

    def post(self, request, pk):
        article = _my_articles(request).filter(pk=pk).first()
        if article is None:
            return Response({"detail": "Статья не найдена."}, status=404)
        if article.moderation not in (M.PENDING, M.APPROVED):
            return Response({"detail": "Статья и так в черновиках."}, status=400)
        article.moderation = M.DRAFT
        article.is_published = False
        article.is_featured = False
        article.save(update_fields=["moderation", "is_published", "is_featured", "updated_at"])
        return Response(MyArticleSerializer(article, context={"request": request}).data)


# ── Модерация (сотрудники) ─────────────────────────────────────────────────

class ModerateSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["approve", "reject"])
    comment = serializers.CharField(max_length=1000, required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["decision"] == "reject" and not attrs["comment"].strip():
            raise serializers.ValidationError({"comment": ["Напишите автору, что поправить."]})
        return attrs


class ModerateArticleView(APIView):
    permission_classes = [CanPublishContent]

    def post(self, request, pk):
        ser = ModerateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        with transaction.atomic():
            article = (Article.objects.select_for_update().filter(pk=pk, specialist__isnull=False)
                       .exclude(moderation=M.DRAFT).first())
            if article is None:
                return Response({"detail": "Статья не найдена."}, status=404)
            if article.moderation != M.PENDING:
                return Response({"detail": "Решение по статье уже принято."}, status=400)
            decision, comment = ser.validated_data["decision"], ser.validated_data["comment"].strip()
            now = timezone.now()
            article.moderation = M.APPROVED if decision == "approve" else M.REJECTED
            article.moderation_comment = comment
            article.moderated_at = now
            article.moderated_by = request.user
            article.is_published = decision == "approve"
            if decision == "approve":
                article.published_at = article.published_at or now
            article.save()
        _audit(request, f"content.article.{decision}", article,
               {"slug": article.slug, "specialist": article.specialist_id})
        return Response(ArticleManageSerializer(article, context={"request": request}).data)


class FeatureArticleView(APIView):
    permission_classes = [CanPublishContent]

    def post(self, request, pk):
        article = Article.objects.filter(pk=pk).first()
        if article is None:
            return Response({"detail": "Статья не найдена."}, status=404)
        featured = bool(request.data.get("featured"))
        if featured and not article.is_published:
            return Response({"detail": "В топ можно поднять только опубликованную статью."}, status=400)
        if article.is_featured != featured:
            article.is_featured = featured
            article.save(update_fields=["is_featured", "updated_at"])
            _audit(request, "content.article.feature" if featured else "content.article.unfeature", article,
                   {"slug": article.slug})
        return Response(ArticleManageSerializer(article, context={"request": request}).data)


# ── Прочтения ──────────────────────────────────────────────────────────────

class ReadThrottle(AnonRateThrottle):
    rate = "120/hour"
    scope = "article_read"


class ArticleReadView(APIView):
    """+1 прочтение. Без cookie и без привязки к пользователю: только счётчик."""

    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [ReadThrottle]

    def post(self, request, slug):
        n = Article.objects.filter(slug=slug, is_published=True).update(reads=F("reads") + 1)
        return Response(status=204 if n else 404)
