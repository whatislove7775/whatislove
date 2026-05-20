import hashlib

from django.contrib.auth import authenticate
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, PsychologistProfile


def _hash_email(email: str) -> str:
    salt = "ANON_PSY_EMAIL_SALT_v1"
    return hashlib.sha256(f"{salt}:{email.lower().strip()}".encode()).hexdigest()


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


class EmailLoginView(generics.GenericAPIView):
    """Принимает email + password, хеширует email на сервере, возвращает JWT."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "")
        password = request.data.get("password", "")
        if not email or not password:
            return Response({"detail": "Укажите email и пароль."}, status=400)
        email_hash = _hash_email(email)
        user = authenticate(request, email_hash=email_hash, password=password)
        if user is None:
            return Response({"detail": "Неверный email или пароль."}, status=401)
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role,
            "alias": user.alias,
        })


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
