"""
Правила переписки клиента и специалиста (владелец сервиса, раунд 8):

Файлы и изображения
- поддержка aprosop — без ограничений (и сотрудники, и клиенты/специалисты, пишущие в поддержку);
- специалист → клиенту: только после того, как в диалоге записан созвон (оплачен/идёт/завершён);
- клиент → специалисту: только если специалист включил «Принимать файлы от клиентов»
  и в паре есть записанный созвон;
- в чат с Тишей файлы не отправляются.

Контакты
- пока у пары не было ни одного завершённого созвона, в сообщениях (в обе стороны) и в
  названиях файлов нельзя передавать телефоны, @ники, ссылки на мессенджеры и почту.
"""
import logging

from rest_framework import status
from rest_framework.exceptions import APIException

from apps.sessions.models import ConsultationSession

from .contacts import Hit, describe, find_contacts
from .models import Conversation, SpecialistChatSettings

logger = logging.getLogger(__name__)
Kind = Conversation.Kind
S = ConsultationSession.Status
BOOKED = (S.PAID, S.IN_PROGRESS, S.COMPLETED)

NEED_BOOKING = "Файлы — после записи на созвон"
NOT_ACCEPTING = "Специалист не принимает файлы в чате"


def _pair(conv: Conversation) -> dict:
    """{booked, completed} для пары клиент–специалист; кэшируется на объекте разговора."""
    cached = getattr(conv, "_pair_state", None)
    if cached is not None:
        return cached
    state = {"booked": False, "completed": False}
    if conv.kind == Kind.SPECIALIST and conv.client_id and conv.specialist_id:
        statuses = set(ConsultationSession.objects.filter(
            client_id=conv.client_id, psychologist_profile_id=conv.specialist_id, status__in=BOOKED,
        ).values_list("status", flat=True).distinct())
        state = {"booked": bool(statuses), "completed": S.COMPLETED in statuses}
    conv._pair_state = state
    return state


def accepts_client_files(profile_id) -> bool:
    return SpecialistChatSettings.objects.filter(specialist_id=profile_id, accept_client_files=True).exists()


def file_policy(role: str | None, conv: Conversation) -> tuple[bool, str | None]:
    """(можно ли отправлять файлы, короткая причина для подсказки, если нельзя)."""
    if conv.kind == Kind.AI or role is None:
        return False, None
    if conv.is_support:
        return True, None
    if conv.kind != Kind.SPECIALIST:
        return False, None
    booked = _pair(conv)["booked"]
    if role == "specialist":
        return (True, None) if booked else (False, NEED_BOOKING)
    if role == "client":
        if not accepts_client_files(conv.specialist_id):
            return False, NOT_ACCEPTING
        return (True, None) if booked else (False, NEED_BOOKING)
    return False, None


def contacts_locked(conv: Conversation) -> bool:
    return conv.kind == Kind.SPECIALIST and not _pair(conv)["completed"]


class ContactsBlocked(APIException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_code = "contacts_blocked"

    def __init__(self, hits: list[Hit], field: str = "text", detail: str | None = None):
        what = describe(hits)
        self.detail = {
            "detail": detail or f"До первого созвона нельзя обмениваться контактами: уберите {what}.",
            "code": "contacts_blocked",
            "field": field,
            "fragments": [h.as_dict() for h in hits],
        }


def check_contacts(conv: Conversation, text: str, field: str = "text") -> None:
    if not text or not contacts_locked(conv):
        return
    hits = find_contacts(text)
    if hits:
        # Только количество — содержимое не логируем
        logger.info("chat.contacts: blocked %s with %d fragment(s)", field, len(hits))
        raise ContactsBlocked(hits, field,
                              "Название файла похоже на контакт — переименуйте файл." if field == "file" else None)
