from django.urls import path, include

urlpatterns = [
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/sessions/", include("apps.sessions.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
]
