from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from django.utils import timezone

from apps.users.models import PsychologistProfile
from apps.payments.services import create_session_with_token, initiate_payment
from .models import ConsultationSession


class BookSessionSerializer(serializers.Serializer):
    psychologist_profile_id = serializers.IntegerField()
    scheduled_at = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField(default=50, min_value=30, max_value=120)

    def validate_scheduled_at(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Время сессии должно быть в будущем.")
        return value


class SessionResponseSerializer(serializers.ModelSerializer):
    payment_url = serializers.SerializerMethodField()
    webrtc_room_id = serializers.UUIDField(read_only=True)

    class Meta:
        model = ConsultationSession
        fields = [
            "id", "status", "scheduled_at", "duration_minutes",
            "amount_kopecks", "webrtc_room_id", "payment_url",
        ]

    def get_payment_url(self, obj):
        try:
            return obj.payment.confirmation_url
        except Exception:
            return None


class BookSessionView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = BookSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            psychologist = PsychologistProfile.objects.get(
                id=data["psychologist_profile_id"],
                verification_status=PsychologistProfile.VerificationStatus.APPROVED,
            )
        except PsychologistProfile.DoesNotExist:
            return Response(
                {"detail": "Психолог не найден или не верифицирован."},
                status=status.HTTP_404_NOT_FOUND,
            )

        session = create_session_with_token(
            client_user=request.user,
            psychologist_profile=psychologist,
            scheduled_at=data["scheduled_at"],
            duration_minutes=data["duration_minutes"],
        )
        payment = initiate_payment(session)

        response_data = SessionResponseSerializer(session).data
        return Response(response_data, status=status.HTTP_201_CREATED)


class SessionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SessionResponseSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == "client":
            return ConsultationSession.objects.filter(client=user).order_by("-scheduled_at")
        return ConsultationSession.objects.filter(
            psychologist_profile__user=user
        ).order_by("-scheduled_at")


class SessionDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SessionResponseSerializer

    def get_queryset(self):
        user = self.request.user
        # Клиент видит только свои сессии; психолог — свои
        if user.role == "client":
            return ConsultationSession.objects.filter(client=user)
        return ConsultationSession.objects.filter(
            psychologist_profile__user=user
        )
