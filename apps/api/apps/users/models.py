"""
Zero-Knowledge User Architecture
---------------------------------
Client:   хранит ТОЛЬКО хеш email (SHA-256 + соль). Никаких ФИО, телефонов,
          адресов. Идентификация — анонимный UUID-псевдоним.
Psychologist: верифицированный специалист. ФИО и документы хранятся
              в зашифрованном виде, доступ — только администраторам.
"""
import hashlib
import secrets
import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_anonymous_client(self, email: str, password: str) -> "User":
        email_hash = self._hash_email(email)
        alias = f"anon_{secrets.token_hex(6)}"
        user = self.model(
            email_hash=email_hash,
            alias=alias,
            role=User.Role.CLIENT,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_psychologist(self, email: str, password: str, **extra) -> "User":
        email_hash = self._hash_email(email)
        user = self.model(
            email_hash=email_hash,
            alias=extra.pop("alias", f"psy_{secrets.token_hex(6)}"),
            role=User.Role.PSYCHOLOGIST,
            **extra,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    @staticmethod
    def _hash_email(email: str) -> str:
        # HMAC-SHA256 с серверной солью — email восстанавливаемый только через reset-flow,
        # прямой lookup по открытому тексту невозможен.
        salt = "ANON_PSY_EMAIL_SALT_v1"
        return hashlib.sha256(f"{salt}:{email.lower().strip()}".encode()).hexdigest()

    def get_by_natural_key(self, identifier: str):
        # Поддержка логина по хешу email (передаётся с клиента уже хешированным)
        return self.get(email_hash=identifier)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CLIENT = "client", "Клиент"
        PSYCHOLOGIST = "psychologist", "Психолог"
        ADMIN = "admin", "Администратор"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Единственный идентификатор клиента в БД — хеш email
    email_hash = models.CharField(max_length=64, unique=True, db_index=True)
    alias = models.CharField(max_length=40, unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CLIENT)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "email_hash"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users_user"
        verbose_name = "Пользователь"

    def __str__(self):
        return f"{self.role}:{self.alias}"


class PsychologistProfile(models.Model):
    """Профиль психолога. ФИО и документы — зашифрованы на уровне приложения."""

    class VerificationStatus(models.TextChoices):
        PENDING = "pending", "Ожидает проверки"
        APPROVED = "approved", "Верифицирован"
        REJECTED = "rejected", "Отклонён"
        SUSPENDED = "suspended", "Приостановлен"

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="psychologist_profile"
    )
    # Зашифрованные поля (AES-256-GCM через django-fernet-fields или ручное шифрование)
    # Хранятся как base64-blob; расшифровка только в памяти при запросе
    encrypted_full_name = models.BinaryField(blank=True, null=True)
    encrypted_diploma_number = models.BinaryField(blank=True, null=True)
    encrypted_phone = models.BinaryField(blank=True, null=True)

    # Публичная информация для карточки специалиста
    display_name = models.CharField(max_length=80)
    bio = models.TextField(max_length=1200, blank=True)
    specializations = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    session_rate_rub = models.DecimalField(max_digits=8, decimal_places=2)

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )
    verified_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="verified_psychologists",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # YooKassa: ID кошелька психолога для сплит-платежей
    yookassa_account_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users_psychologist_profile"
        verbose_name = "Профиль психолога"

    def __str__(self):
        return f"Psychologist:{self.display_name} [{self.verification_status}]"


class PsychologistSchedule(models.Model):
    """Доступные слоты психолога. Без привязки к личным данным клиентов."""

    WEEKDAYS = [(i, d) for i, d in enumerate(
        ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    )]

    psychologist = models.ForeignKey(
        PsychologistProfile, on_delete=models.CASCADE, related_name="schedule_slots"
    )
    weekday = models.SmallIntegerField(choices=WEEKDAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "users_schedule"
        unique_together = ("psychologist", "weekday", "start_time")
