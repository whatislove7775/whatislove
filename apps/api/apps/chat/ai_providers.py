"""
Провайдеры ИИ для «Тиши». Выбор — переменная окружения AI_PROVIDER:

- anthropic          — Anthropic Claude API (ANTHROPIC_API_KEY, AI_MODEL, AI_EFFORT);
- gigachat           — Sber GigaChat API (GIGACHAT_AUTH_KEY или GIGACHAT_CLIENT_ID + GIGACHAT_CLIENT_SECRET,
                       GIGACHAT_SCOPE, GIGACHAT_MODEL, GIGACHAT_CA_BUNDLE — сертификат Минцифры);
- openai_compatible  — любой OpenAI-совместимый /chat/completions (OpenRouter, YandexGPT, Ollama, vLLM…):
                       OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_MODEL.

Подробно (по-русски, для владельца) — docs/AI.md.

Все провайдеры получают одинаковый системный промпт и историю (без личных данных, см. ai.py)
и стримят ответ по кусочкам. HTTP для GigaChat и OpenAI-совместимых — стандартная библиотека
(urllib), чтение потока идёт в отдельном потоке, чтобы не блокировать event loop.
Ни запросы, ни ответы не логируются.
"""
import asyncio
import base64
import json
import ssl
import threading
import time
import urllib.error
import urllib.request
import uuid
from collections.abc import AsyncIterator

from . import conf

TIMEOUT = 90


class AIRefusal(Exception):
    """Модель отказалась отвечать (фильтр безопасности провайдера)."""


class ProviderError(Exception):
    """Ошибка провайдера (сеть, авторизация, лимиты). Текст — без содержимого переписки."""


# ── HTTP ──────────────────────────────────────────────────────────────────────

def ssl_context(ca_bundle: str = "") -> ssl.SSLContext:
    """Системные корневые сертификаты + дополнительный бандл (например, НУЦ Минцифры для GigaChat)."""
    ctx = ssl.create_default_context()
    if ca_bundle:
        ctx.load_verify_locations(cafile=ca_bundle)
    return ctx


def _open(req: urllib.request.Request, ctx: ssl.SSLContext, timeout: float = TIMEOUT):
    """Единственная точка выхода в сеть — в тестах подменяется."""
    return urllib.request.urlopen(req, context=ctx, timeout=timeout)  # noqa: S310 — URL из настроек


def _request(url: str, headers: dict, body: bytes, ctx: ssl.SSLContext):
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        return _open(req, ctx)
    except urllib.error.HTTPError as exc:
        code = exc.code
        exc.close()
        raise ProviderError(f"HTTP {code}") from None
    except urllib.error.URLError as exc:
        raise ProviderError(f"network: {type(exc.reason).__name__}") from None


async def _sse_json(url: str, headers: dict, payload: dict, ctx: ssl.SSLContext) -> AsyncIterator[dict]:
    """POST и чтение Server-Sent Events: отдаёт распарсенные JSON из строк «data: …» до «[DONE]»."""
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    resp = await asyncio.to_thread(_request, url, headers, body, ctx)
    try:
        while True:
            line = await asyncio.to_thread(resp.readline)
            if not line:
                break
            line = line.decode("utf-8", "replace").strip()
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            try:
                obj = json.loads(data)
            except json.JSONDecodeError:
                continue
            if isinstance(obj, dict):
                if obj.get("error"):
                    raise ProviderError("stream error")
                yield obj
    finally:
        await asyncio.to_thread(resp.close)


async def _openai_style_stream(url: str, headers: dict, payload: dict, ctx: ssl.SSLContext) -> AsyncIterator[str]:
    """Общий разбор потока chat/completions (GigaChat и OpenAI-совместимые отвечают одинаково)."""
    async for obj in _sse_json(url, headers, payload, ctx):
        for choice in obj.get("choices") or []:
            delta = choice.get("delta") or {}
            text = delta.get("content")
            if text:
                yield text
            # GigaChat: blacklist — сработал фильтр; OpenAI: content_filter
            if choice.get("finish_reason") in ("blacklist", "content_filter"):
                raise AIRefusal()


def _messages(system: str, history: list[dict]) -> list[dict]:
    return [{"role": "system", "content": system}, *history]


# ── Провайдеры ────────────────────────────────────────────────────────────────

class Provider:
    name = ""

    def configured(self) -> bool:  # pragma: no cover — интерфейс
        raise NotImplementedError

    def stream(self, system: str, history: list[dict], max_tokens: int) -> AsyncIterator[str]:  # pragma: no cover
        raise NotImplementedError


class AnthropicProvider(Provider):
    name = "anthropic"

    def configured(self) -> bool:
        return bool(conf.ai_api_key())

    async def stream(self, system, history, max_tokens):
        import anthropic

        async with anthropic.AsyncAnthropic(api_key=conf.ai_api_key(), timeout=90.0, max_retries=2) as client:
            async with client.messages.stream(
                model=conf.ai_model(),
                max_tokens=max_tokens,
                system=system,
                messages=history,
                output_config={"effort": conf.ai_effort()},
                cache_control={"type": "ephemeral"},
            ) as stream:
                async for text in stream.text_stream:
                    yield text
                final = await stream.get_final_message()
                if final.stop_reason == "refusal":
                    raise AIRefusal()


class GigaChatProvider(Provider):
    """Sber GigaChat: OAuth (client credentials) → access token на 30 минут → /chat/completions (SSE)."""

    name = "gigachat"
    _lock = threading.Lock()
    _token: tuple[str, float] | None = None  # (token, истекает в unix-секундах)

    def _auth_key(self) -> str:
        key = conf.gigachat_auth_key()
        if key:
            return key
        cid, secret = conf.gigachat_client_id(), conf.gigachat_client_secret()
        if cid and secret:
            return base64.b64encode(f"{cid}:{secret}".encode()).decode()
        return ""

    def configured(self) -> bool:
        return bool(self._auth_key())

    def _ctx(self) -> ssl.SSLContext:
        return ssl_context(conf.gigachat_ca_bundle())

    def access_token(self) -> str:
        with self._lock:
            cached = GigaChatProvider._token
            if cached and cached[1] - 60 > time.time():
                return cached[0]
            body = f"scope={conf.gigachat_scope()}".encode()
            headers = {
                "Authorization": f"Basic {self._auth_key()}",
                "RqUID": str(uuid.uuid4()),
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            }
            resp = _request(conf.gigachat_auth_url(), headers, body, self._ctx())
            try:
                data = json.loads(resp.read().decode("utf-8"))
            except (ValueError, UnicodeDecodeError):
                raise ProviderError("gigachat: bad token response") from None
            finally:
                resp.close()
            token = data.get("access_token")
            if not token:
                raise ProviderError("gigachat: no access_token")
            expires = data.get("expires_at")
            # expires_at — в миллисекундах; на всякий случай понимаем и секунды
            if isinstance(expires, (int, float)) and expires > 0:
                expires_s = expires / 1000 if expires > 10**11 else float(expires)
            else:
                expires_s = time.time() + 25 * 60
            GigaChatProvider._token = (token, expires_s)
            return token

    @classmethod
    def reset_token(cls):
        cls._token = None

    async def stream(self, system, history, max_tokens):
        token = await asyncio.to_thread(self.access_token)
        url = conf.gigachat_base_url().rstrip("/") + "/chat/completions"
        payload = {
            "model": conf.gigachat_model(),
            "messages": _messages(system, history),
            "stream": True,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json",
                   "Accept": "text/event-stream"}
        try:
            async for text in _openai_style_stream(url, headers, payload, self._ctx()):
                yield text
        except ProviderError as exc:
            if "HTTP 401" in str(exc):
                self.reset_token()  # токен отозван раньше срока — возьмём новый в следующий раз
            raise


class OpenAICompatibleProvider(Provider):
    """OpenAI-совместимый /chat/completions: OpenRouter, YandexGPT (llm.api.cloud.yandex.net/v1), Ollama…"""

    name = "openai_compatible"

    def configured(self) -> bool:
        return bool(conf.openai_base_url() and conf.openai_model())

    async def stream(self, system, history, max_tokens):
        url = conf.openai_base_url().rstrip("/") + "/chat/completions"
        headers = {"Content-Type": "application/json", "Accept": "text/event-stream"}
        if conf.openai_api_key():
            headers["Authorization"] = f"Bearer {conf.openai_api_key()}"
        payload = {
            "model": conf.openai_model(),
            "messages": _messages(system, history),
            "stream": True,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        async for text in _openai_style_stream(url, headers, payload, ssl_context(conf.openai_ca_bundle())):
            yield text


PROVIDERS: dict[str, type[Provider]] = {
    p.name: p for p in (AnthropicProvider, GigaChatProvider, OpenAICompatibleProvider)
}


def get_provider() -> Provider | None:
    cls = PROVIDERS.get(conf.ai_provider())
    return cls() if cls else None
