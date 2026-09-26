"""L1: живое селфи для проверки специалиста — приватность, права, журнал, срок хранения."""
from datetime import timedelta
from io import BytesIO

import pytest
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.utils import timezone
from PIL import Image

from apps.staff.models import AuditLog, StaffMember
from apps.users.models import PsychologistProfile, User
from apps.verification.models import SpecialistSelfie

from .conftest import auth_client


def _frame(color):
    buf = BytesIO()
    Image.new("RGB", (640, 480), color).save(buf, format="JPEG")
    return SimpleUploadedFile("f.jpg", buf.getvalue(), content_type="image/jpeg")


def _staff(role):
    user = User.objects.create_user(alias=f"staff-{role}", password="staffpass12345", role="admin")
    StaffMember.objects.create(user=user, role=role)
    return auth_client(user)


@pytest.fixture
def pending(db):
    user = User.objects.create_psychologist(email="new@example.com", password="psypass12345")
    return PsychologistProfile.objects.create(user=user, display_name="Мария", session_rate_rub=2500)


def _take(client):
    code = client.get("/api/v1/psychologist/selfie/").json()["challenge"]["code"]
    return client.post("/api/v1/psychologist/selfie/", {
        "frame1": _frame((200, 180, 160)), "frame2": _frame((190, 170, 150)), "challenge": code,
    }, format="multipart")


@pytest.mark.django_db
def test_selfie_capture_is_stored_encrypted(pending):
    psy = auth_client(pending.user)
    state = psy.get("/api/v1/psychologist/selfie/").json()
    assert state["taken_at"] is None and state["retention_days"] == 30 and state["challenge"]["text"]
    # Без свежей подсказки — отказ
    r = psy.post("/api/v1/psychologist/selfie/", {"frame1": _frame((1, 2, 3)), "frame2": _frame((4, 5, 6)),
                                                   "challenge": "smile-fake"}, format="multipart")
    assert r.status_code == 400
    # Одинаковые кадры — отказ
    code = psy.get("/api/v1/psychologist/selfie/").json()["challenge"]["code"]
    r = psy.post("/api/v1/psychologist/selfie/", {"frame1": _frame((9, 9, 9)), "frame2": _frame((9, 9, 9)),
                                                   "challenge": code}, format="multipart")
    assert r.status_code == 400
    r = _take(psy)
    assert r.status_code == 201 and r.json()["taken_at"] and r.json()["delete_after"] is None
    selfie = SpecialistSelfie.objects.get(profile=pending)
    raw = bytes(selfie.frame1_enc)
    assert not raw.startswith(b"RIFF") and b"WEBP" not in raw[:64]  # зашифровано, не картинка


@pytest.mark.django_db
def test_selfie_visible_only_to_verifiers_and_audited(api, pending, psychologist, client_user):
    _take(auth_client(pending.user))
    url = f"/api/v1/staff/specialists/{pending.pk}/selfie/frames/"
    # Ни публично, ни клиенту, ни другому специалисту, ни модератору/поддержке/редактору
    assert api.get(url).status_code == 401
    assert auth_client(client_user).get(url).status_code == 403
    assert auth_client(psychologist.user).get(url).status_code == 403
    assert auth_client(pending.user).get(url).status_code == 403
    for role in ("moderator", "support", "editor", "developer"):
        assert _staff(role).get(url).status_code == 403
    # Кадров нет в публичных и кабинетных ответах
    assert "frame" not in str(auth_client(pending.user).get("/api/v1/psychologist/selfie/").json())
    assert "selfie" not in api.get(f"/api/v1/psychologists/{pending.pk}/").content.decode()

    admin = _staff("admin")
    meta = admin.get(f"/api/v1/staff/specialists/{pending.pk}/selfie/").json()
    assert meta["exists"] and not AuditLog.objects.filter(action="specialist.selfie.view").exists()
    r = admin.get(url)
    assert r.status_code == 200 and r["Cache-Control"] == "no-store"
    frames = r.json()["frames"]
    assert len(frames) == 2 and all(f.startswith("data:image/webp;base64,") for f in frames)
    log = AuditLog.objects.get(action="specialist.selfie.view")
    assert log.target_id == str(pending.pk) and "data:" not in str(log.details)


@pytest.mark.django_db
def test_approval_requires_selfie_and_selfie_expires(pending, settings):
    admin = _staff("admin")
    r = admin.post(f"/api/v1/staff/specialists/{pending.pk}/decision/", {"decision": "approve"}, format="json")
    assert r.status_code == 400 and "селфи" in r.json()["detail"]
    _take(auth_client(pending.user))
    r = admin.post(f"/api/v1/staff/specialists/{pending.pk}/decision/", {"decision": "approve"}, format="json")
    assert r.status_code == 200
    pending.refresh_from_db()
    meta = admin.get(f"/api/v1/staff/specialists/{pending.pk}/selfie/").json()
    assert meta["delete_after"]
    # После одобрения переснять нельзя
    cache.clear()
    assert _take(auth_client(pending.user)).status_code == 400

    # Через 30 дней после одобрения — удаляется
    call_command("purge_selfies")
    assert SpecialistSelfie.objects.filter(profile=pending).exists()
    old = timezone.now() - timedelta(days=31)
    PsychologistProfile.objects.filter(pk=pending.pk).update(verified_at=old)
    SpecialistSelfie.objects.filter(profile=pending).update(taken_at=old)
    call_command("purge_selfies")
    assert not SpecialistSelfie.objects.filter(profile=pending).exists()
    assert admin.get(f"/api/v1/staff/specialists/{pending.pk}/selfie/frames/").status_code == 404

    # Настройка срока
    settings.VERIFICATION_SELFIE_RETENTION_DAYS = 7
    assert auth_client(pending.user).get("/api/v1/psychologist/selfie/").json()["retention_days"] == 7
