"""R8: правила файлов в чатах, изображения без EXIF, запрет контактов до первого созвона."""
import io
import json
import logging
from pathlib import Path

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from apps.chat.contacts import find_contacts
from apps.chat.models import Attachment, Message
from apps.chat.crypto import decrypt_bytes
from apps.sessions.models import ConsultationSession

from .conftest import auth_client
from .test_chat import PDF, book, open_chat

S = ConsultationSession.Status
CASES = json.loads((Path(__file__).parent / "data" / "contact_cases.json").read_text("utf-8"))


def _url(conv):
    return f"/api/v1/chat/conversations/{conv['id']}/messages/"


def _pdf(name="план.pdf"):
    return {"kind": "file", "file": SimpleUploadedFile(name, PDF, "application/pdf")}


def _jpeg_with_exif() -> bytes:
    im = Image.new("RGB", (40, 20), (200, 120, 90))
    exif = Image.Exif()
    exif[0x010F] = "Apple"          # Make
    exif[0x0110] = "iPhone 15"      # Model
    exif[0x0112] = 6                # Orientation: повернуть на 90°
    exif[0x0132] = "2026:09:01 10:00:00"
    buf = io.BytesIO()
    im.save(buf, "JPEG", exif=exif.tobytes())
    return buf.getvalue()


@pytest.fixture
def dialogue(client_user, psychologist):
    c = auth_client(client_user)
    conv = open_chat(c, psychologist)  # без записи (CHAT_ALLOW_WITHOUT_BOOKING по умолчанию)
    return c, auth_client(psychologist.user), conv


# ── Файлы ─────────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_specialist_files_only_after_booking(dialogue, client_user, psychologist):
    c, p, conv = dialogue
    pconv = p.get(f"/api/v1/chat/conversations/{conv['id']}/").json()
    assert pconv["can_send_files"] is False and pconv["files_hint"] == "Файлы — после записи на созвон"
    assert p.post(_url(conv), _pdf(), format="multipart").status_code == 403

    # Ожидает оплаты — ещё не запись
    book(client_user, psychologist, S.AWAITING_PAYMENT)
    assert p.post(_url(conv), _pdf(), format="multipart").status_code == 403
    book(client_user, psychologist, S.PAID)
    assert p.get(f"/api/v1/chat/conversations/{conv['id']}/").json()["can_send_files"] is True
    assert p.post(_url(conv), _pdf(), format="multipart").status_code == 201


@pytest.mark.django_db
def test_client_files_need_setting_and_booking(dialogue, client_user, psychologist):
    c, p, conv = dialogue
    detail = c.get(f"/api/v1/chat/conversations/{conv['id']}/").json()
    assert detail["can_send_files"] is False and detail["files_hint"] == "Специалист не принимает файлы в чате"

    # Настройка специалиста, по умолчанию выключена
    assert p.get("/api/v1/chat/settings/").json() == {"accept_client_files": False}
    assert c.get("/api/v1/chat/settings/").status_code == 403
    assert p.patch("/api/v1/chat/settings/", {"accept_client_files": "yes"}, format="json").status_code == 400
    assert p.patch("/api/v1/chat/settings/", {"accept_client_files": True}, format="json").json() == {
        "accept_client_files": True}

    detail = c.get(f"/api/v1/chat/conversations/{conv['id']}/").json()
    assert detail["can_send_files"] is False and detail["files_hint"] == "Файлы — после записи на созвон"
    assert c.post(_url(conv), _pdf(), format="multipart").status_code == 403

    book(client_user, psychologist, S.COMPLETED)
    assert c.get(f"/api/v1/chat/conversations/{conv['id']}/").json()["can_send_files"] is True
    assert c.post(_url(conv), _pdf(), format="multipart").status_code == 201

    p.patch("/api/v1/chat/settings/", {"accept_client_files": False}, format="json")
    assert c.post(_url(conv), _pdf(), format="multipart").status_code == 403


@pytest.mark.django_db
def test_support_files_unrestricted(client_user, admin_user):
    c = auth_client(client_user)
    conv = c.post("/api/v1/chat/conversations/", {"with": "support"}, format="json").json()
    assert conv["can_send_files"] is True and conv["files_hint"] is None and conv["contacts_locked"] is False
    assert c.post(_url(conv), _pdf(), format="multipart").status_code == 201
    staff = auth_client(admin_user)
    assert staff.post(_url(conv), _pdf("ответ.pdf"), format="multipart").status_code == 201
    # В поддержку можно писать и контакты (например, для возврата платежа)
    assert c.post(_url(conv), {"text": "мой номер +7 912 345-67-89"}, format="json").status_code == 201


@pytest.mark.django_db
def test_ai_chat_has_no_attach(client_user, settings):
    settings.ANTHROPIC_API_KEY = "k"
    c = auth_client(client_user)
    st = c.post("/api/v1/chat/ai/consent/").json()
    conv = c.get(f"/api/v1/chat/conversations/{st['conversation_id']}/").json()
    assert conv["can_send_files"] is False and conv["files_hint"] is None


@pytest.mark.django_db
def test_image_exif_stripped_and_previewable(client_user, psychologist):
    book(client_user, psychologist, S.PAID)
    c = auth_client(client_user)
    conv = open_chat(c, psychologist)
    p = auth_client(psychologist.user)
    raw = _jpeg_with_exif()
    assert Image.open(io.BytesIO(raw)).getexif().get(0x0110) == "iPhone 15"

    resp = p.post(_url(conv), {"kind": "file", "file": SimpleUploadedFile("фото.jpg", raw, "image/jpeg")},
                  format="multipart")
    assert resp.status_code == 201, resp.content
    att = resp.json()["attachment"]
    # Поворот из EXIF применён: 40×20 → 20×40
    assert att["mime"] == "image/jpeg" and (att["width"], att["height"]) == (20, 40)

    stored = decrypt_bytes(Attachment.objects.get(message_id=resp.json()["id"]).data_enc)
    assert b"iPhone" not in stored and b"Apple" not in stored
    assert len(Image.open(io.BytesIO(stored)).getexif()) == 0

    dl = c.get(f"/api/v1/chat/messages/{resp.json()['id']}/attachment/")
    assert dl.status_code == 200 and dl["Content-Disposition"].startswith("inline")
    assert b"iPhone" not in dl.content

    # PNG с текстовыми метаданными и «битая» картинка
    im = Image.new("RGBA", (10, 10))
    from PIL.PngImagePlugin import PngInfo
    info = PngInfo()
    info.add_text("Author", "secret-name")
    buf = io.BytesIO()
    im.save(buf, "PNG", pnginfo=info)
    ok = p.post(_url(conv), {"kind": "file", "file": SimpleUploadedFile("a.png", buf.getvalue())},
                format="multipart")
    assert ok.status_code == 201
    assert b"secret-name" not in decrypt_bytes(Attachment.objects.get(message_id=ok.json()["id"]).data_enc)
    bad = p.post(_url(conv), {"kind": "file", "file": SimpleUploadedFile("b.png", b"\x89PNG\r\n\x1a\n" + b"0" * 50)},
                 format="multipart")
    assert bad.status_code == 400


# ── Контакты ──────────────────────────────────────────────────────────────────

@pytest.mark.parametrize("text,kind", CASES["blocked"])
def test_contacts_detected(text, kind):
    hits = find_contacts(text)
    assert hits and hits[0].kind == kind, text


@pytest.mark.parametrize("text", CASES["allowed"])
def test_no_false_positives(text):
    assert find_contacts(text) == [], text


def test_fragment_positions():
    text = "Привет! Вот мой номер: 8 912 345-67-89, а ещё @anna_psy"
    hits = find_contacts(text)
    assert [(h.kind, text[h.start:h.end]) for h in hits] == [("phone", "8 912 345-67-89"), ("handle", "@anna_psy")]


@pytest.mark.django_db
def test_contacts_blocked_until_first_completed_call(dialogue, client_user, psychologist, caplog):
    c, p, conv = dialogue
    assert c.get(f"/api/v1/chat/conversations/{conv['id']}/").json()["contacts_locked"] is True
    secret = "пиши в телеграм @ivan_petrov или 8 912 345 67 89"
    with caplog.at_level(logging.INFO):
        resp = c.post(_url(conv), {"text": secret}, format="json")
    assert resp.status_code == 422
    body = resp.json()
    assert body["code"] == "contacts_blocked" and "контакт" in body["detail"]
    frags = [secret[f["start"]:f["end"]] for f in body["fragments"]]
    assert "@ivan_petrov" in frags and "8 912 345 67 89" in frags
    assert Message.objects.filter(conversation_id=conv["id"], kind="text").count() == 0
    # В логах — только количество, без текста
    assert "ivan" not in caplog.text and "912" not in caplog.text
    assert "fragment" in caplog.text

    # Обычные сообщения с временем и ценой проходят
    assert c.post(_url(conv), {"text": "Удобно завтра в 18:00? Цена 3 400 ₽"}, format="json").status_code == 201
    # Специалист тоже не может
    assert p.post(_url(conv), {"text": "мой whatsapp: +7 999 000 11 22"}, format="json").status_code == 422
    ok = p.post(_url(conv), {"text": "Здравствуйте! Давайте созвонимся в 19:30"}, format="json")
    assert ok.status_code == 201
    # Редактирование тоже проверяется
    assert p.patch(f"/api/v1/chat/messages/{ok.json()['id']}/", {"text": "t.me/anna"},
                   format="json").status_code == 422

    # Оплаченный, но не проведённый созвон — ещё рано
    book(client_user, psychologist, S.PAID)
    assert c.post(_url(conv), {"text": "anna@mail.ru"}, format="json").status_code == 422
    # Файл с контактом в названии
    assert p.post(_url(conv), _pdf("звоните 89123456789.pdf"), format="multipart").status_code == 422

    book(client_user, psychologist, S.COMPLETED)
    assert c.get(f"/api/v1/chat/conversations/{conv['id']}/").json()["contacts_locked"] is False
    assert c.post(_url(conv), {"text": "anna@mail.ru"}, format="json").status_code == 201


@pytest.mark.django_db
def test_profile_texts_checked_for_contacts(psychologist):
    p = auth_client(psychologist.user)
    resp = p.patch("/api/v1/psychologist/profile/", {"bio": "Пишите в WhatsApp +7 912 345 67 89"}, format="json")
    assert resp.status_code == 400 and "bio" in resp.json()
    resp = p.patch("/api/v1/psychologist/profile/", {"approach": "КПТ. Мой инстаграм: instagram.com/anna"},
                   format="json")
    assert resp.status_code == 400 and "approach" in resp.json()
    ok = p.patch("/api/v1/psychologist/profile/",
                 {"bio": "Работаю с тревогой 7 лет, сессии 50–90 минут, 3 400 ₽"}, format="json")
    assert ok.status_code == 200


def test_image_reencode_keeps_pixels_and_transparency():
    """Скриншоты (RGBA, палитра с прозрачностью, оттенки серого) после удаления метаданных не «белеют»."""
    from PIL import ImageDraw

    from apps.chat.images import sanitize_image

    def roundtrip(im, fmt="PNG", **kw):
        buf = io.BytesIO()
        im.save(buf, fmt, **kw)
        raw = buf.getvalue()
        out, w, h = sanitize_image(raw, fmt.lower())
        return Image.open(io.BytesIO(raw)).convert("RGBA"), Image.open(io.BytesIO(out)).convert("RGBA"), (w, h)

    shot = Image.new("RGBA", (320, 200), (0, 0, 0, 0))
    ImageDraw.Draw(shot).rectangle((20, 20, 300, 180), fill=(30, 60, 200, 255))
    pal = Image.new("P", (20, 20), 3)
    pal.putpalette([0, 0, 0, 255, 0, 0, 0, 255, 0, 255, 255, 255] * 64)
    pal.putpixel((5, 5), 1)
    gray = Image.new("L", (800, 500), 240)
    ImageDraw.Draw(gray).line((0, 0, 799, 499), fill=0, width=3)
    for im, kw in ((shot, {}), (pal, {"transparency": 3}), (gray, {})):
        src, dst, size = roundtrip(im, **kw)
        assert size == im.size and list(src.getdata()) == list(dst.getdata())
    src, dst, _ = roundtrip(pal, "GIF", transparency=3)
    assert dst.getpixel((0, 0))[3] == 0 and dst.getpixel((5, 5)) == (255, 0, 0, 255)
