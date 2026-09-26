from datetime import timedelta
from io import BytesIO

from django.conf import settings
from django.utils import timezone
from PIL import Image, ImageOps, UnidentifiedImageError

CHALLENGES = {
    "turn_left": "Поверните голову влево",
    "turn_right": "Поверните голову вправо",
    "smile": "Улыбнитесь",
    "nod": "Слегка наклоните голову",
}

MAX_BYTES = 3 * 1024 * 1024
MIN_SIDE = 240
MAX_SIDE = 1080


class FrameError(ValueError):
    pass


def retention_days() -> int:
    try:
        return max(1, int(getattr(settings, "VERIFICATION_SELFIE_RETENTION_DAYS", 30)))
    except (TypeError, ValueError):
        return 30


def selfie_required() -> bool:
    return bool(getattr(settings, "VERIFICATION_SELFIE_REQUIRED", True))


def delete_after(selfie):
    """Когда селфи удалится: N дней после одобрения профиля (или None, пока профиль не одобрен)."""
    profile = selfie.profile
    if profile.verification_status != profile.VerificationStatus.APPROVED or not profile.verified_at:
        return None
    return max(profile.verified_at, selfie.taken_at) + timedelta(days=retention_days())


def purge_expired() -> int:
    """Удаляет селфи одобренных специалистов старше срока хранения. → сколько удалено."""
    from apps.users.models import PsychologistProfile

    from .models import SpecialistSelfie

    cutoff = timezone.now() - timedelta(days=retention_days())
    qs = SpecialistSelfie.objects.filter(
        profile__verification_status=PsychologistProfile.VerificationStatus.APPROVED,
        profile__verified_at__lte=cutoff,
        taken_at__lte=cutoff,
    )
    n, _ = qs.delete()
    return n


def has_selfie(profile) -> bool:
    from .models import SpecialistSelfie

    return SpecialistSelfie.objects.filter(profile=profile).exists()


def process_frame(upload) -> bytes:
    """Кадр с камеры (JPEG/WebP из canvas) → WebP без метаданных, до 1080 px по стороне."""
    if upload is None:
        raise FrameError("Нужны два кадра с камеры.")
    if upload.size > MAX_BYTES:
        raise FrameError("Кадр слишком большой.")
    raw = upload.read()
    try:
        with Image.open(BytesIO(raw)) as probe:
            fmt = probe.format
            probe.verify()
        img = Image.open(BytesIO(raw))
        img.load()
        img = ImageOps.exif_transpose(img)
    except (UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombError):
        raise FrameError("Не получилось прочитать кадр. Попробуйте снять ещё раз.")
    if fmt not in ("JPEG", "WEBP", "PNG"):
        raise FrameError("Не получилось прочитать кадр. Попробуйте снять ещё раз.")
    if min(img.size) < MIN_SIDE:
        raise FrameError("Кадр слишком маленький: камера отдала слишком низкое разрешение.")
    img = img.convert("RGB")
    if max(img.size) > MAX_SIDE:
        img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    clean = Image.new("RGB", img.size)
    clean.paste(img)
    out = BytesIO()
    clean.save(out, format="WEBP", quality=82, method=4)
    return out.getvalue()
