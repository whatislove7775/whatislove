"""Изображения в чате: перекодируем, чтобы убрать EXIF (геопозиция, модель телефона, время съёмки)
и прочие метаданные, учитываем поворот из EXIF и уменьшаем слишком большие снимки."""
import io

from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework.exceptions import ValidationError

MAX_SIDE = 2560
MAX_PIXELS = 50_000_000
IMAGE_EXTS = {"png", "jpg", "jpeg", "webp", "gif"}
_FORMATS = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG", "webp": "WEBP", "gif": "GIF"}
_BAD = "Не получилось открыть изображение."


def sanitize_image(data: bytes, ext: str) -> tuple[bytes, int, int]:
    """→ (новые байты без метаданных, ширина, высота)."""
    fmt = _FORMATS[ext]
    try:
        with Image.open(io.BytesIO(data)) as probe:
            if probe.width * probe.height > MAX_PIXELS:
                raise ValidationError({"file": "Изображение слишком большое."})
            probe.verify()
        im = Image.open(io.BytesIO(data))
        im.load()
    except (UnidentifiedImageError, OSError, SyntaxError, Image.DecompressionBombError) as exc:
        raise ValidationError({"file": _BAD}) from exc

    out = io.BytesIO()
    if fmt == "GIF" and getattr(im, "is_animated", False):
        # Анимацию сохраняем кадрами; комментарии/XMP не переносим
        frames = []
        durations = []
        for i in range(im.n_frames):
            im.seek(i)
            frames.append(im.copy())
            durations.append(im.info.get("duration", 100))
        frames[0].info = {}
        frames[0].save(out, "GIF", save_all=True, append_images=frames[1:], duration=durations,
                       loop=im.info.get("loop", 0), disposal=2)
        return out.getvalue(), im.width, im.height

    icc = im.info.get("icc_profile")
    transparency = im.info.get("transparency")  # прозрачность палитровых PNG/GIF — не метаданные
    im = ImageOps.exif_transpose(im)  # поворот из EXIF — до удаления EXIF
    im.info = {}
    if max(im.size) > MAX_SIDE:
        im.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    params: dict = {}
    if fmt == "JPEG":
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        params = {"quality": 88, "optimize": True}
    elif fmt == "WEBP":
        params = {"quality": 88}
    elif fmt == "GIF" and im.mode not in ("P", "L"):
        im = im.convert("P")
    if transparency is not None and fmt in ("PNG", "GIF") and im.mode in ("P", "L", "RGB"):
        params["transparency"] = transparency
    if icc and fmt in ("JPEG", "PNG", "WEBP"):
        params["icc_profile"] = icc  # цветовой профиль — не персональные данные
    im.save(out, fmt, **params)
    return out.getvalue(), im.width, im.height
