import base64
import hashlib
import secrets

from django.core.cache import cache
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from apps.chat.crypto import decrypt_bytes, encrypt_bytes
from apps.staff.audit import audit
from apps.staff.permissions import StaffPerm
from apps.users.models import PsychologistProfile
from apps.users.permissions import IsPsychologist

from . import services
from .models import SpecialistSelfie

V = PsychologistProfile.VerificationStatus
CHALLENGE_TTL = 15 * 60


def _challenge_key(user_id) -> str:
    return f"selfie-challenge:{user_id}"


def _state(profile, selfie):
    after = services.delete_after(selfie) if selfie else None
    return {
        "taken_at": selfie.taken_at if selfie else None,
        "delete_after": after,
        "retention_days": services.retention_days(),
        "required": services.selfie_required(),
    }


class SelfieThrottle(UserRateThrottle):
    rate = "20/hour"
    scope = "verification_selfie"


class MySelfieView(APIView):
    """GET — есть ли селфи + новая подсказка для второго кадра; POST — два кадра с камеры.

    Сам специалист свои кадры не скачивает: они нужны только для проверки."""

    permission_classes = [IsPsychologist]
    parser_classes = [MultiPartParser, FormParser]

    def get_throttles(self):
        return [SelfieThrottle()] if self.request.method == "POST" else []

    def get(self, request):
        services.purge_expired()
        profile = request.user.psychologist_profile
        selfie = SpecialistSelfie.objects.filter(profile=profile).select_related("profile").first()
        code = secrets.choice(list(services.CHALLENGES))
        cache.set(_challenge_key(request.user.pk), code, CHALLENGE_TTL)
        return Response({**_state(profile, selfie), "challenge": {"code": code, "text": services.CHALLENGES[code]}})

    def post(self, request):
        profile = request.user.psychologist_profile
        if profile.verification_status == V.APPROVED:
            return Response({"detail": "Профиль уже проверен, селфи больше не нужно."}, status=400)
        code = str(request.data.get("challenge") or "")
        expected = cache.get(_challenge_key(request.user.pk))
        if not expected or code != expected:
            return Response({"detail": "Подсказка устарела. Откройте камеру и снимите ещё раз."}, status=400)
        try:
            f1 = services.process_frame(request.FILES.get("frame1"))
            f2 = services.process_frame(request.FILES.get("frame2"))
        except services.FrameError as exc:
            return Response({"detail": str(exc)}, status=400)
        if hashlib.sha256(f1).digest() == hashlib.sha256(f2).digest():
            return Response({"detail": "Кадры одинаковые. Выполните подсказку и снимите ещё раз."}, status=400)
        cache.delete(_challenge_key(request.user.pk))
        selfie, _ = SpecialistSelfie.objects.update_or_create(
            profile=profile,
            defaults={"frame1_enc": encrypt_bytes(f1), "frame2_enc": encrypt_bytes(f2), "challenge": code},
        )
        return Response(_state(profile, selfie), status=status.HTTP_201_CREATED)


def _profile_or_404(pk):
    return PsychologistProfile.objects.filter(pk=pk).first()


class StaffSelfieView(APIView):
    """Есть ли селфи у специалиста (без самих кадров, в журнал не пишется)."""

    permission_classes = [StaffPerm("specialists.verify")]

    def get(self, request, pk):
        services.purge_expired()
        profile = _profile_or_404(pk)
        if profile is None:
            return Response({"detail": "Специалист не найден."}, status=404)
        selfie = SpecialistSelfie.objects.filter(profile=profile).first()
        return Response({**_state(profile, selfie), "exists": selfie is not None,
                         "challenge_text": services.CHALLENGES.get(selfie.challenge, "") if selfie else ""})


class StaffSelfieFramesView(APIView):
    """Сами кадры (data: URI). Каждый просмотр — запись в журнале действий."""

    permission_classes = [StaffPerm("specialists.verify")]

    def get(self, request, pk):
        services.purge_expired()
        profile = _profile_or_404(pk)
        selfie = SpecialistSelfie.objects.filter(profile=profile).first() if profile else None
        if selfie is None:
            return Response({"detail": "Селфи нет или оно уже удалено."}, status=404)
        frames = [
            "data:image/webp;base64," + base64.b64encode(decrypt_bytes(bytes(enc))).decode()
            for enc in (selfie.frame1_enc, selfie.frame2_enc)
        ]
        audit(request, "specialist.selfie.view", target=profile)
        resp = Response({"frames": frames, "challenge_text": services.CHALLENGES.get(selfie.challenge, ""),
                         "taken_at": selfie.taken_at})
        resp["Cache-Control"] = "no-store"
        return resp
