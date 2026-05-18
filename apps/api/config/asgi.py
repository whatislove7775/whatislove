import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import re_path
from apps.signaling.consumers import SignalingConsumer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(
            URLRouter(
                [
                    re_path(
                        r"^ws/signaling/(?P<room_id>[0-9a-f-]{36})/$",
                        SignalingConsumer.as_asgi(),
                    ),
                ]
            )
        ),
    }
)
