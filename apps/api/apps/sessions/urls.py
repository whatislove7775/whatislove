from django.urls import path
from .views import BookSessionView, SessionDetailView

urlpatterns = [
    path("book/", BookSessionView.as_view(), name="session_book"),
    path("<uuid:pk>/", SessionDetailView.as_view(), name="session_detail"),
]
