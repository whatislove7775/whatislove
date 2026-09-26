"""
Живое селфи специалиста для проверки профиля.

Специалист снимает себя камерой прямо в кабинете (без загрузки файла): два кадра —
обычный и после подсказки («поверните голову» / «улыбнитесь»). Кадры хранятся
зашифрованными в БД (Fernet, как вложения чата), nginx их не раздаёт. Смотреть их могут
только сотрудники с правом specialists.verify, каждый просмотр пишется в журнал.
Через VERIFICATION_SELFIE_RETENTION_DAYS дней после одобрения профиля селфи удаляется
(purge_selfies в воркере + ленивая очистка при обращении).
"""
from django.db import models


class SpecialistSelfie(models.Model):
    profile = models.OneToOneField(
        "users.PsychologistProfile", on_delete=models.CASCADE, related_name="verification_selfie"
    )
    frame1_enc = models.BinaryField()
    frame2_enc = models.BinaryField()
    # Подсказка для второго кадра (код из CHALLENGES) — сотрудник видит, что должно быть на кадре
    challenge = models.CharField(max_length=20)
    taken_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "verification_selfie"
        verbose_name = "Селфи для проверки"

    def __str__(self):
        return f"Selfie:{self.profile_id}"
