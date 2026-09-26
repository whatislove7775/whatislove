from django.core.management.base import BaseCommand

from apps.verification.services import purge_expired, retention_days


class Command(BaseCommand):
    help = "Удаляет селфи для проверки через VERIFICATION_SELFIE_RETENTION_DAYS дней после одобрения профиля."

    def handle(self, *args, **options):
        n = purge_expired()
        if n:
            self.stdout.write(f"purge_selfies: удалено {n} (срок {retention_days()} дн.)")
