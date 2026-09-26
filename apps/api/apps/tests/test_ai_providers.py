"""Провайдеры «Тиши»: anthropic / gigachat / openai_compatible. Сеть замокана (ai_providers._open)."""
import base64
import io
import json
import time
from unittest import mock

import pytest
from asgiref.sync import async_to_sync

from apps.chat import ai, ai_providers
from apps.chat.ai_providers import GigaChatProvider

from .conftest import auth_client


class FakeResp(io.BytesIO):
    pass


def sse(*chunks, finish="stop", done=True) -> bytes:
    lines = []
    for text in chunks:
        lines.append("data: " + json.dumps({"choices": [{"delta": {"content": text}, "index": 0}]},
                                           ensure_ascii=False))
    lines.append("data: " + json.dumps({"choices": [{"delta": {}, "finish_reason": finish, "index": 0}]}))
    if done:
        lines.append("data: [DONE]")
    return ("\n\n".join(lines) + "\n\n").encode("utf-8")


class Net:
    """Записывает запросы и отвечает по URL."""

    def __init__(self, routes):
        self.routes = routes
        self.calls = []

    def __call__(self, req, ctx, timeout=90):
        body = req.data.decode("utf-8") if req.data else ""
        self.calls.append({"url": req.full_url, "headers": {k.lower(): v for k, v in req.header_items()},
                           "body": body, "ctx": ctx})
        for prefix, resp in self.routes.items():
            if req.full_url.startswith(prefix):
                out = resp() if callable(resp) else resp
                if isinstance(out, Exception):
                    raise out
                return FakeResp(out)
        raise AssertionError(f"unexpected URL {req.full_url}")


def run(history=None):
    async def go():
        return [t async for t in ai.stream_reply(history or [{"role": "user", "content": "мне тревожно"}])]

    return async_to_sync(go)()


@pytest.fixture(autouse=True)
def _reset_token():
    GigaChatProvider.reset_token()
    yield
    GigaChatProvider.reset_token()


def test_default_provider_is_anthropic(settings):
    settings.ANTHROPIC_API_KEY = ""
    assert ai_providers.get_provider().name == "anthropic" and not ai.enabled()
    settings.ANTHROPIC_API_KEY = "k"
    assert ai.enabled()
    settings.AI_PROVIDER = "unknown"
    assert ai_providers.get_provider() is None and not ai.enabled()


def test_gigachat_oauth_and_stream(settings):
    settings.AI_PROVIDER = "gigachat"
    settings.GIGACHAT_CLIENT_ID = "cid"
    settings.GIGACHAT_CLIENT_SECRET = "sec"
    settings.GIGACHAT_MODEL = "GigaChat-2"
    settings.GIGACHAT_AUTH_URL = "https://auth.test/api/v2/oauth"
    settings.GIGACHAT_BASE_URL = "https://giga.test/api/v1/"
    assert ai.enabled()
    expires_ms = int((time.time() + 1800) * 1000)
    net = Net({
        "https://auth.test/": lambda: json.dumps({"access_token": "tok-1", "expires_at": expires_ms}).encode(),
        "https://giga.test/api/v1/chat/completions": lambda: sse("Слышу ", "тебя."),
    })
    with mock.patch.object(ai_providers, "_open", net):
        assert run() == ["Слышу ", "тебя."]
        assert run() == ["Слышу ", "тебя."]  # токен из кэша

    auth = [c for c in net.calls if c["url"].startswith("https://auth.test/")]
    assert len(auth) == 1
    h = auth[0]["headers"]
    assert h["authorization"] == "Basic " + base64.b64encode(b"cid:sec").decode()
    assert len(h["rquid"]) == 36 and auth[0]["body"] == "scope=GIGACHAT_API_PERS"
    assert h["content-type"] == "application/x-www-form-urlencoded"

    chat = [c for c in net.calls if "chat/completions" in c["url"]][0]
    assert chat["headers"]["authorization"] == "Bearer tok-1"
    payload = json.loads(chat["body"])
    assert payload["model"] == "GigaChat-2" and payload["stream"] is True
    assert payload["messages"][0]["role"] == "system" and "Тиша" in payload["messages"][0]["content"]
    assert "112" in payload["messages"][0]["content"]  # протокол безопасности на месте
    assert payload["messages"][1] == {"role": "user", "content": "мне тревожно"}


def test_gigachat_auth_key_scope_and_ca_bundle(settings, tmp_path):
    settings.AI_PROVIDER = "gigachat"
    settings.GIGACHAT_AUTH_KEY = "QUJD"  # готовый «ключ авторизации»
    settings.GIGACHAT_SCOPE = "GIGACHAT_API_B2B"
    settings.GIGACHAT_CA_BUNDLE = str(tmp_path / "missing.crt")
    with pytest.raises(FileNotFoundError):
        # Неверный путь к сертификату — понятная ошибка, а не молчаливое отключение проверки TLS
        GigaChatProvider()._ctx()

    ctx = mock.Mock()
    with mock.patch.object(ai_providers, "ssl_context", return_value=ctx) as mk:
        net = Net({
            "https://ngw.devices.sberbank.ru:9443/api/v2/oauth":
                lambda: json.dumps({"access_token": "t", "expires_at": int(time.time() * 1000) + 10**6}).encode(),
            "https://api.giga.chat/v1/chat/completions": lambda: sse("ок"),
        })
        with mock.patch.object(ai_providers, "_open", net):
            assert run() == ["ок"]
    mk.assert_called_with(str(tmp_path / "missing.crt"))
    assert all(c["ctx"] is ctx for c in net.calls)
    assert net.calls[0]["headers"]["authorization"] == "Basic QUJD"
    assert net.calls[0]["body"] == "scope=GIGACHAT_API_B2B"


def test_gigachat_blacklist_is_refusal_and_401_resets_token(settings):
    settings.AI_PROVIDER = "gigachat"
    settings.GIGACHAT_AUTH_KEY = "k"
    tokens = iter(["t1", "t2"])
    net = Net({
        "https://ngw.devices.sberbank.ru": lambda: json.dumps(
            {"access_token": next(tokens), "expires_at": int(time.time() * 1000) + 10**6}).encode(),
        "https://api.giga.chat/v1/chat/completions": lambda: sse("Не могу", finish="blacklist"),
    })
    with mock.patch.object(ai_providers, "_open", net):
        with pytest.raises(ai.AIRefusal):
            run()

    import urllib.error

    def unauthorized():
        return urllib.error.HTTPError("u", 401, "Unauthorized", {}, io.BytesIO(b"{}"))

    net.routes["https://api.giga.chat/v1/chat/completions"] = unauthorized
    with mock.patch.object(ai_providers, "_open", net):
        with pytest.raises(ai_providers.ProviderError):
            run()
    assert GigaChatProvider._token is None


def test_openai_compatible_stream(settings):
    settings.AI_PROVIDER = "openai_compatible"
    settings.OPENAI_BASE_URL = ""
    assert not ai.enabled()
    settings.OPENAI_BASE_URL = "https://openrouter.test/api/v1"
    settings.OPENAI_MODEL = "meta-llama/llama-3.3-70b-instruct:free"
    settings.OPENAI_API_KEY = "sk-or-1"
    assert ai.enabled()
    net = Net({"https://openrouter.test/api/v1/chat/completions": lambda: b": keep-alive\n\n" + sse("При", "вет")})
    with mock.patch.object(ai_providers, "_open", net):
        assert run() == ["При", "вет"]
    call = net.calls[0]
    assert call["headers"]["authorization"] == "Bearer sk-or-1"
    body = json.loads(call["body"])
    assert body["model"].endswith(":free") and body["messages"][0]["role"] == "system"

    # Ollama: ключ не нужен
    settings.OPENAI_API_KEY = ""
    settings.OPENAI_BASE_URL = "http://ollama.test:11434/v1"
    settings.OPENAI_MODEL = "qwen2.5"
    net = Net({"http://ollama.test:11434/v1/chat/completions": lambda: sse("ок", done=False)})
    with mock.patch.object(ai_providers, "_open", net):
        assert run() == ["ок"]
    assert "authorization" not in net.calls[0]["headers"]

    # content_filter → отказ; ошибка сети → ProviderError
    net = Net({"http://ollama.test:11434/v1/chat/completions": lambda: sse("x", finish="content_filter")})
    with mock.patch.object(ai_providers, "_open", net):
        with pytest.raises(ai.AIRefusal):
            run()
    import urllib.error

    net = Net({"http://ollama.test": lambda: urllib.error.URLError(ConnectionRefusedError())})
    with mock.patch.object(ai_providers, "_open", net):
        with pytest.raises(ai_providers.ProviderError):
            run()


@pytest.mark.django_db
def test_reply_endpoint_through_gigachat(client_user, settings):
    """Сквозной путь /chat/ai/reply/ c GigaChat: те же лимиты, согласие, скрытие контактов."""
    from .test_chat import _sse_events

    settings.AI_PROVIDER = "gigachat"
    settings.GIGACHAT_AUTH_KEY = ""
    c = auth_client(client_user)
    assert c.get("/api/v1/chat/ai/").json()["enabled"] is False
    assert c.post("/api/v1/chat/ai/reply/", {"text": "привет"}, format="json").json()["code"] == "ai_unavailable"

    settings.GIGACHAT_AUTH_KEY = "k"
    settings.AI_DAILY_LIMIT = 1
    c.post("/api/v1/chat/ai/consent/")
    net = Net({
        "https://ngw.devices.sberbank.ru": lambda: json.dumps(
            {"access_token": "t", "expires_at": int(time.time() * 1000) + 10**6}).encode(),
        "https://api.giga.chat/": lambda: sse("Я ", "рядом."),
    })
    with mock.patch.object(ai_providers, "_open", net):
        events = _sse_events(c.post("/api/v1/chat/ai/reply/", {"text": "мой номер +7 912 345 67 89"},
                                    format="json"))
        assert c.post("/api/v1/chat/ai/reply/", {"text": "ещё"}, format="json").status_code == 429
    assert [e["type"] for e in events] == ["user_message", "delta", "delta", "done"]
    assert events[-1]["message"]["text"] == "Я рядом."
    sent = json.loads([x for x in net.calls if "chat/completions" in x["url"]][0]["body"])
    assert "912" not in json.dumps(sent, ensure_ascii=False)
