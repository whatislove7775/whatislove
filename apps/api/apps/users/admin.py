import hashlib

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AuthenticationForm
from .models import User, PsychologistProfile, PsychologistSchedule


def _hash_email(email: str) -> str:
    salt = "ANON_PSY_EMAIL_SALT_v1"
    return hashlib.sha256(f"{salt}:{email.lower().strip()}".encode()).hexdigest()


class EmailAuthForm(AuthenticationForm):
    """Принимает обычный email, хеширует перед аутентификацией."""
    username = forms.EmailField(label="Email", widget=forms.EmailInput(attrs={"autofocus": True}))

    def clean_username(self):
        return _hash_email(self.cleaned_data["username"])


admin.site.login_form = EmailAuthForm
admin.site.login_template = None


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("alias", "role", "is_staff", "is_active", "date_joined")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("alias",)
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email_hash", "password")}),
        ("Профиль", {"fields": ("alias", "role")}),
        ("Права", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Даты", {"fields": ("date_joined", "last_login")}),
    )
    add_fieldsets = (
        (None, {"fields": ("email_hash", "alias", "role", "password1", "password2")}),
    )
    readonly_fields = ("date_joined", "last_login", "email_hash")


@admin.register(PsychologistProfile)
class PsychologistProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "verification_status", "session_rate_rub", "created_at")
    list_filter = ("verification_status",)
    search_fields = ("display_name",)
    list_editable = ("verification_status",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Публичная информация", {"fields": ("user", "display_name", "bio", "specializations", "languages", "session_rate_rub")}),
        ("Верификация", {"fields": ("verification_status", "verified_by", "verified_at", "rejection_reason")}),
        ("Платежи", {"fields": ("yookassa_account_id",)}),
        ("Даты", {"fields": ("created_at", "updated_at")}),
    )


@admin.register(PsychologistSchedule)
class PsychologistScheduleAdmin(admin.ModelAdmin):
    list_display = ("psychologist", "weekday", "start_time", "end_time", "is_active")
    list_filter = ("is_active", "weekday")
