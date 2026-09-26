from django.urls import path

from . import views

# /api/v1/psychologist/selfie/
urlpatterns_cabinet = [
    path("", views.MySelfieView.as_view(), name="my_selfie"),
]

# /api/v1/staff/specialists/<pk>/selfie/
urlpatterns_staff = [
    path("", views.StaffSelfieView.as_view(), name="staff_selfie"),
    path("frames/", views.StaffSelfieFramesView.as_view(), name="staff_selfie_frames"),
]
