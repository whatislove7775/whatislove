from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    AliasCheckView, AliasSuggestView, AnonymousSignupView, ChangePasswordView, MyAliasView, DeleteAccountView, LoginView, MeView,
    PsychologistRegisterView, RecoverView,
)

# /api/v1/auth/
urlpatterns = [
    path("anonymous/", AnonymousSignupView.as_view(), name="auth_anonymous"),
    path("register/psychologist/", PsychologistRegisterView.as_view(), name="register_psychologist"),
    path("login/", LoginView.as_view(), name="login"),
    path("recover/", RecoverView.as_view(), name="recover"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("alias/suggest/", AliasSuggestView.as_view(), name="alias_suggest"),
    path("alias/check/", AliasCheckView.as_view(), name="alias_check"),
    path("me/alias/", MyAliasView.as_view(), name="me_alias"),
    path("me/password/", ChangePasswordView.as_view(), name="me_password"),
    path("me/delete/", DeleteAccountView.as_view(), name="me_delete"),
]
