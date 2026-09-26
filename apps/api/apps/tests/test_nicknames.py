from datetime import timedelta

import pytest
from django.utils import timezone

from apps.users.models import User
from apps.users.nicknames import alias_error, check_alias

from .conftest import auth_client


@pytest.mark.parametrize(
    "value",
    ["тихая сова", "Sunny_Fox", "кот-в-сапогах-7", "ab-c", "Ёжик в тумане", "  много   пробелов  "],
)
def test_valid_aliases(value):
    assert alias_error(value) is None, value


@pytest.mark.parametrize(
    "value,fragment",
    [
        ("ab", "короче"),
        ("x" * 33, "длиннее"),
        ("me@mail.ru", "почтой"),
        ("@handle", "почтой"),
        ("site.ru", "почтой"),
        ("https-mysite", "ссылкой"),
        ("www-kot", "ссылкой"),
        ("89161234567", "букв"),
        ("tel 8916123456", "телефона"),
        ("кот!", "Только буквы"),
        ("admin-kot", "зарезервирован"),
        ("Поддержка", "зарезервирован"),
        ("ху йло", "другой"),
        ("fuck you", "другой"),
        ("xyйня", "другой"),
        ("сука", "другой"),
    ],
)
def test_invalid_aliases(value, fragment):
    err = alias_error(value)
    assert err and fragment.lower() in err.lower(), (value, err)


@pytest.mark.parametrize("value", ["рубля", "корабля", "требую", "хлеба", "сукно"])
def test_profanity_filter_no_false_positives(value):
    assert alias_error(value) is None, value


@pytest.mark.django_db
def test_check_normalizes_and_detects_taken(client_user):
    client_user.alias = "тихая сова"
    client_user.save()
    res = check_alias("  Тихая   СОВА ")
    assert res == {"alias": "тихая сова", "available": False, "error": "Этот ник уже занят."}
    # свой текущий ник — не «занят»
    assert check_alias("тихая сова", user=client_user)["available"] is True


@pytest.mark.django_db
def test_signup_with_custom_alias_and_login_case_insensitive(api):
    resp = api.post("/api/v1/auth/anonymous/", {"password": "secret-pass-1", "alias": "Лунный  Ёж"}, format="json")
    assert resp.status_code == 201, resp.content
    assert resp.json()["user"]["alias"] == "лунный еж"
    resp = api.post("/api/v1/auth/login/", {"login": "ЛУННЫЙ ЁЖ", "password": "secret-pass-1"}, format="json")
    assert resp.status_code == 200, resp.content
    # занято (без учёта регистра)
    resp = api.post("/api/v1/auth/anonymous/", {"password": "secret-pass-1", "alias": "лунный еж"}, format="json")
    assert resp.status_code == 400
    assert "alias" in resp.json()
    # пустой ник → сгенерированный
    resp = api.post("/api/v1/auth/anonymous/", {"password": "secret-pass-1", "alias": ""}, format="json")
    assert resp.status_code == 201


@pytest.mark.django_db
def test_suggest_and_check_endpoints(api):
    resp = api.get("/api/v1/auth/alias/suggest/")
    assert resp.status_code == 200
    alias = resp.json()["alias"]
    assert alias_error(alias) is None
    resp = api.get("/api/v1/auth/alias/check/", {"alias": "ok-nick"})
    assert resp.json() == {"alias": "ok-nick", "available": True, "error": None}
    resp = api.get("/api/v1/auth/alias/check/", {"alias": "a@b"})
    assert resp.json()["available"] is False


@pytest.mark.django_db
def test_change_alias_once_per_day(client_user):
    c = auth_client(client_user)
    old = client_user.alias
    resp = c.get("/api/v1/auth/me/alias/")
    assert resp.json() == {"alias": old, "next_change_at": None}

    resp = c.post("/api/v1/auth/me/alias/", {"alias": "Новый Кит"}, format="json")
    assert resp.status_code == 200, resp.content
    body = resp.json()
    assert body["alias"] == "новый кит"
    assert body["user"]["alias"] == "новый кит"
    assert body["next_change_at"]
    client_user.refresh_from_db()
    assert client_user.alias == "новый кит"
    # старый ник нигде не хранится и снова свободен
    assert not User.objects.filter(alias=old).exists()

    resp = c.post("/api/v1/auth/me/alias/", {"alias": "ещё один"}, format="json")
    assert resp.status_code == 429
    assert resp.json()["alias"] == "новый кит"

    # через сутки — можно
    User.objects.filter(pk=client_user.pk).update(alias_changed_at=timezone.now() - timedelta(days=1, minutes=1))
    resp = c.post("/api/v1/auth/me/alias/", {"alias": "ещё один"}, format="json")
    assert resp.status_code == 200, resp.content


@pytest.mark.django_db
def test_change_alias_validation_and_roles(client_user, psychologist):
    other = User.objects.create_anonymous_client("clientpass123", alias="занятый ник")
    c = auth_client(client_user)
    resp = c.post("/api/v1/auth/me/alias/", {"alias": "ЗАНЯТЫЙ ник"}, format="json")
    assert resp.status_code == 400
    assert resp.json()["alias"] == ["Этот ник уже занят."]
    resp = c.post("/api/v1/auth/me/alias/", {"alias": "+7 916 123 45 67"}, format="json")
    assert resp.status_code == 400
    client_user.refresh_from_db()
    assert client_user.alias_changed_at is None  # неудачные попытки не расходуют смену
    assert other.alias == "занятый ник"

    resp = auth_client(psychologist.user).post("/api/v1/auth/me/alias/", {"alias": "psy-nick"}, format="json")
    assert resp.status_code == 403
    assert auth_client(client_user).post("/api/v1/auth/me/alias/", {"alias": "x"}, format="json").status_code == 400
