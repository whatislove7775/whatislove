import os
import uuid

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from livekit.api import AccessToken, VideoGrants

LIVEKIT_API_KEY    = os.environ.get("LIVEKIT_API_KEY",    "aprosop")
LIVEKIT_API_SECRET = os.environ.get("LIVEKIT_API_SECRET", "anonpsy_lk_secret_2024")


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def livekit_token(request):
    room  = request.query_params.get("room", "")
    if not room:
        return Response({"detail": "room param required"}, status=400)

    identity = str(request.user.alias or uuid.uuid4())[:16]

    token = (
        AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        .with_identity(identity)
        .with_name(identity)
        .with_grants(VideoGrants(
            room_join=True,
            room=room,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True,
        ))
    )

    return Response({"token": token.to_jwt()})
