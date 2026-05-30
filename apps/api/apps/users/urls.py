from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterClientView, RegisterPsychologistView,
    EmailLoginView, PsychologistListView, PsychologistDetailView,
)

urlpatterns = [
    path("register/", RegisterClientView.as_view(), name="register"),
    path("register/psychologist/", RegisterPsychologistView.as_view(), name="register_psychologist"),
    path("login/", EmailLoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("psychologists/", PsychologistListView.as_view(), name="psychologist_list"),
    path("psychologists/<uuid:pk>/", PsychologistDetailView.as_view(), name="psychologist_detail"),
]
