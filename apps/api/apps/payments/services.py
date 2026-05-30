"""
Сервис безопасной сделки — логика генерации токена и инициации платежа YooKassa.

Схема работы:
1. Клиент выбирает психолога и слот → POST /api/v1/sessions/book/
2. Сервер создаёт ConsultationSession со случайным session_token (64 hex)
3. Сервер инициирует платёж в YooKassa с metadata: {session_token}
4. Клиент редиректируется на confirmation_url (hosted page YooKassa)
5. YooKassa → вебхук POST /api/v1/payments/webhook/ → захват платежа
6. Сессия переходит в статус PAID, токен активируется
7. После завершения сессии → Payout психологу по yookassa_account_id
"""
import decimal
import uuid

from django.conf import settings
from django.db import transaction
from django.utils import timezone

try:
    from yookassa import Configuration, Payment as YKPayment
    from yookassa.domain.models import Airline
    YOOKASSA_AVAILABLE = True
except ImportError:
    YOOKASSA_AVAILABLE = False

from apps.sessions.models import ConsultationSession, SessionEvent
from apps.payments.models import Payment, Payout


def _configure_yookassa() -> None:
    if not YOOKASSA_AVAILABLE:
        raise RuntimeError("yookassa пакет не установлен")
    Configuration.account_id = settings.YOOKASSA_SHOP_ID
    Configuration.secret_key = settings.YOOKASSA_SECRET_KEY


@transaction.atomic
def create_session_with_token(
    client_user,
    psychologist_profile,
    scheduled_at,
    duration_minutes: int = 50,
    amount_kopecks: int = None,
) -> ConsultationSession:
    rate = psychologist_profile.session_rate_rub
    if amount_kopecks is None:
        amount_kopecks = int(rate * 100)

    session = ConsultationSession(
        client=client_user,
        psychologist_profile=psychologist_profile,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        status=ConsultationSession.Status.DRAFT,
        amount_kopecks=amount_kopecks,
    )
    session.compute_split(settings.PLATFORM_FEE_PERCENT)
    session.save()

    SessionEvent.objects.create(
        session=session,
        event_type=SessionEvent.EventType.TOKEN_CREATED,
        metadata={"token_expires_at": session.token_expires_at.isoformat()},
    )
    return session


@transaction.atomic
def initiate_payment(session: ConsultationSession, return_url: str | None = None) -> Payment:
    """
    Шаг 3-4: Инициировать платёж в YooKassa.
    metadata содержит session_token — единственная связь между платежом и сессией.
    Данные плательщика не передаются и не хранятся на нашей стороне.
    """
    if session.status != ConsultationSession.Status.DRAFT:
        raise ValueError(f"Неверный статус сессии для оплаты: {session.status}")

    amount_rub = decimal.Decimal(session.amount_kopecks) / 100
    psychologist_payout_rub = decimal.Decimal(session.psychologist_payout_kopecks) / 100
    platform_fee_rub = decimal.Decimal(session.platform_fee_kopecks) / 100

    idempotency_key = uuid.uuid4()
    confirmation_url = ""

    if YOOKASSA_AVAILABLE and settings.YOOKASSA_SHOP_ID:
        _configure_yookassa()
        yk_payment = YKPayment.create(
            {
                "amount": {"value": str(amount_rub), "currency": "RUB"},
                "confirmation": {
                    "type": "redirect",
                    "return_url": return_url or settings.YOOKASSA_RETURN_URL,
                },
                "capture": False,  # двухстадийный платёж
                "description": f"Консультация #{session.id}",
                "metadata": {
                    # Токен — единственная связь платежа с сессией
                    "session_token": session.session_token,
                    "session_id": str(session.id),
                },
                # Сплит: психолог получает напрямую, платформа — разницу
                "transfers": [
                    {
                        "account_id": session.psychologist_profile.yookassa_account_id,
                        "amount": {
                            "value": str(psychologist_payout_rub),
                            "currency": "RUB",
                        },
                    }
                ] if session.psychologist_profile.yookassa_account_id else [],
            },
            idempotency_key=str(idempotency_key),
        )
        confirmation_url = yk_payment.confirmation.confirmation_url
        yookassa_payment_id = yk_payment.id
    else:
        # Dev-режим: платёж симулируется
        yookassa_payment_id = f"dev_{uuid.uuid4().hex[:16]}"

    payment = Payment.objects.create(
        session=session,
        yookassa_payment_id=yookassa_payment_id,
        status=Payment.Status.PENDING,
        amount_rub=amount_rub,
        psychologist_payout_rub=psychologist_payout_rub,
        platform_fee_rub=platform_fee_rub,
        confirmation_url=confirmation_url,
        idempotency_key=idempotency_key,
    )

    session.status = ConsultationSession.Status.AWAITING_PAYMENT
    session.save(update_fields=["status", "updated_at"])

    SessionEvent.objects.create(
        session=session,
        event_type=SessionEvent.EventType.PAYMENT_INITIATED,
        metadata={"yookassa_payment_id": yookassa_payment_id},
    )
    return payment


@transaction.atomic
def handle_payment_webhook(payload: dict) -> Payment | None:
    """
    Шаг 5: Обработка вебхука от YooKassa.
    Идентификация сессии — ТОЛЬКО по session_token из metadata.
    Никаких персональных данных плательщика не читается и не сохраняется.
    """
    event_type = payload.get("event")
    payment_obj = payload.get("object", {})
    yk_payment_id = payment_obj.get("id")

    try:
        payment = Payment.objects.select_related("session__psychologist_profile").get(
            yookassa_payment_id=yk_payment_id
        )
    except Payment.DoesNotExist:
        return None

    if event_type == "payment.waiting_for_capture":
        payment.status = Payment.Status.WAITING_FOR_CAPTURE
        payment.save(update_fields=["status"])
        # Автозахват в production — вызвать YKPayment.capture()
        _capture_payment(payment)

    elif event_type == "payment.succeeded":
        payment.status = Payment.Status.SUCCEEDED
        payment.captured_at = timezone.now()
        payment.save(update_fields=["status", "captured_at"])

        session = payment.session
        session.status = ConsultationSession.Status.PAID
        session.save(update_fields=["status", "updated_at"])

        SessionEvent.objects.create(
            session=session,
            event_type=SessionEvent.EventType.PAYMENT_CONFIRMED,
            metadata={"yookassa_payment_id": yk_payment_id},
        )

    elif event_type == "payment.canceled":
        payment.status = Payment.Status.CANCELLED
        payment.save(update_fields=["status"])

    return payment


def _capture_payment(payment: Payment) -> None:
    """Захват двухстадийного платежа после подтверждения."""
    if not YOOKASSA_AVAILABLE or not settings.YOOKASSA_SHOP_ID:
        return
    _configure_yookassa()
    YKPayment.capture(
        payment.yookassa_payment_id,
        {"amount": {"value": str(payment.amount_rub), "currency": "RUB"}},
        idempotency_key=str(uuid.uuid4()),
    )
