from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import RegisterClientView, PsychologistListView, PsychologistDetailView

urlpatterns = [
    path("register/", RegisterClientView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain"),
    path("psychologists/", PsychologistListView.as_view(), name="psychologist_list"),
    path("psychologists/<uuid:pk>/", PsychologistDetailView.as_view(), name="psychologist_detail"),
]
