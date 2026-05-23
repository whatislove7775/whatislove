from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/v1/sessions/", include("apps.sessions.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
]
