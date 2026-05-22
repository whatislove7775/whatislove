from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health(request):
    from django.db import connection
    try:
        connection.ensure_connection()
        db = "ok"
    except Exception:
        db = "unavailable"
    return JsonResponse({"status": "ok", "db": db})


urlpatterns = [
    path("api/admin/", admin.site.urls),
    path("api/v1/health/", health),
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/sessions/", include("apps.sessions.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
]
