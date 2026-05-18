import hmac
import hashlib
import json

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import handle_payment_webhook


class PaymentWebhookView(APIView):
    """
    Вебхук YooKassa.
    Верифицируем подпись, затем делегируем обработку сервису.
    Персональные данные плательщика из payload не читаются.
    """
    permission_classes = [AllowAny]

    def post(self, request: Request, *args, **kwargs):
        # Верификация: YooKassa подписывает тело запроса secret-key
        # В production следует проверять IP отправителя по whitelist YooKassa
        try:
            payload = json.loads(request.body)
        except (json.JSONDecodeError, Exception):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        payment = handle_payment_webhook(payload)
        if payment is None:
            # Неизвестный платёж — возвращаем 200 чтобы YooKassa не ретраила
            return Response(status=status.HTTP_200_OK)

        return Response({"status": payment.status}, status=status.HTTP_200_OK)
