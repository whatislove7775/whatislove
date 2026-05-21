from django.urls import path
from .views import BookSessionView, SessionListView, SessionDetailView

urlpatterns = [
    path("", SessionListView.as_view(), name="session_list"),
    path("book/", BookSessionView.as_view(), name="session_book"),
    path("<uuid:pk>/", SessionDetailView.as_view(), name="session_detail"),
]
