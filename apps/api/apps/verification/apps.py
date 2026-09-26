from django.apps import AppConfig


class VerificationConfig(AppConfig):
    name = "apps.verification"
    label = "verification"
    default_auto_field = "django.db.models.BigAutoField"
    verbose_name = "Проверка личности специалистов"
