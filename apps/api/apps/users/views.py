from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework import status
from .models import User, PsychologistProfile


class RegisterClientSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    def create(self, validated_data):
        return User.objects.create_anonymous_client(
            email=validated_data["email"],
            password=validated_data["password"],
        )


class PsychologistListSerializer(serializers.ModelSerializer):
    class Meta:
        model = PsychologistProfile
        fields = [
            "id", "display_name", "bio", "specializations",
            "languages", "session_rate_rub",
        ]


class RegisterClientView(generics.CreateAPIView):
    serializer_class = RegisterClientSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Аккаунт создан. Email не сохранён в открытом виде."},
            status=status.HTTP_201_CREATED,
        )


class PsychologistListView(generics.ListAPIView):
    serializer_class = PsychologistListSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PsychologistProfile.objects.filter(
        verification_status=PsychologistProfile.VerificationStatus.APPROVED
    ).select_related("user")


class PsychologistDetailView(generics.RetrieveAPIView):
    serializer_class = PsychologistListSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = PsychologistProfile.objects.filter(
        verification_status=PsychologistProfile.VerificationStatus.APPROVED
    )
