"""
WebRTC Signaling Consumer (Django Channels)
--------------------------------------------
Сервер — только сигнальный брокер. Медиапоток (видео/аудио) идёт P2P
между клиентом и психологом через WebRTC, минуя сервер.
Сервер видит только: тип сигнала (offer/answer/ice-candidate), room_id.
Содержимое переговоров (SDP, ICE) — зашифровано DTLS на уровне WebRTC.
"""
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

logger = logging.getLogger(__name__)

# Максимум 2 участника в комнате: клиент + психолог
MAX_ROOM_PARTICIPANTS = 2


class SignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"signaling_{self.room_id}"

        # Проверяем количество участников (через Redis cache)
        participants_key = f"room_participants:{self.room_id}"
        current = cache.get(participants_key, 0)
        if current >= MAX_ROOM_PARTICIPANTS:
            await self.close(code=4003)
            return

        cache.set(participants_key, current + 1, timeout=7200)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Уведомляем остальных участников
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "peer.joined", "channel": self.channel_name},
        )
        logger.info("Signaling: participant joined room %s", self.room_id)

    async def disconnect(self, close_code):
        participants_key = f"room_participants:{self.room_id}"
        current = cache.get(participants_key, 1)
        cache.set(participants_key, max(0, current - 1), timeout=7200)

        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_send(
            self.group_name,
            {"type": "peer.left", "channel": self.channel_name},
        )
        logger.info("Signaling: participant left room %s", self.room_id)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            return

        msg_type = data.get("type")
        # Разрешаем только сигнальные типы WebRTC
        allowed_types = {"offer", "answer", "ice-candidate", "ready", "bye"}
        if msg_type not in allowed_types:
            return

        # Ретранслируем сигнал всем в комнате кроме отправителя
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "relay.signal",
                "sender_channel": self.channel_name,
                "payload": data,
            },
        )

    async def relay_signal(self, event):
        # Не отправляем сигнал обратно отправителю
        if event["sender_channel"] == self.channel_name:
            return
        await self.send(text_data=json.dumps(event["payload"]))

    async def peer_joined(self, event):
        if event["channel"] != self.channel_name:
            await self.send(text_data=json.dumps({"type": "peer-joined"}))

    async def peer_left(self, event):
        if event["channel"] != self.channel_name:
            await self.send(text_data=json.dumps({"type": "peer-left"}))
