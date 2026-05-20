from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PsychologistProfile, PsychologistSchedule


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("alias", "role", "is_staff", "is_active", "date_joined")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("alias", "email_hash")
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
    readonly_fields = ("date_joined", "last_login")


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
