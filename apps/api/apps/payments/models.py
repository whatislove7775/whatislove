"""
Payment Models — YooKassa Split
---------------------------------
Все платежи атомарно связаны с одноразовым session_token.
Психолог получает payout по номеру сессии — без знания отправителя.
"""
import uuid

from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Ожидает"
        WAITING_FOR_CAPTURE = "waiting_for_capture", "Ожидает захвата"
        SUCCEEDED = "succeeded", "Успешен"
        CANCELLED = "cancelled", "Отменён"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(
        "sessions.ConsultationSession",
        on_delete=models.PROTECT,
        related_name="payment",
    )
    # ID платежа в YooKassa — для сверки и вебхуков
    yookassa_payment_id = models.CharField(max_length=100, unique=True, blank=True)
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)

    amount_rub = models.DecimalField(max_digits=10, decimal_places=2)
    psychologist_payout_rub = models.DecimalField(max_digits=10, decimal_places=2)
    platform_fee_rub = models.DecimalField(max_digits=10, decimal_places=2)

    # URL для редиректа клиента на страницу оплаты YooKassa
    confirmation_url = models.URLField(blank=True)
    # Вебхук-сигнатура для верификации входящих событий от YooKassa
    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)
    captured_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payments_payment"
        verbose_name = "Платёж"

    def __str__(self):
        return f"Payment {self.id} [{self.status}] {self.amount_rub}₽"


class Payout(models.Model):
    """Выплата психологу. Инициируется после завершения сессии."""

    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Запланирована"
        PROCESSING = "processing", "В обработке"
        SUCCEEDED = "succeeded", "Выполнена"
        FAILED = "failed", "Ошибка"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.OneToOneField(Payment, on_delete=models.PROTECT, related_name="payout")
    psychologist_profile = models.ForeignKey(
        "users.PsychologistProfile", on_delete=models.PROTECT, related_name="payouts"
    )

    yookassa_payout_id = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    amount_rub = models.DecimalField(max_digits=10, decimal_places=2)

    scheduled_at = models.DateTimeField()
    processed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)

    class Meta:
        db_table = "payments_payout"
        verbose_name = "Выплата"
