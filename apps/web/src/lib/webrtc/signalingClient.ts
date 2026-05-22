/**
 * WebRTC Signaling Client
 * ------------------------
 * Управляет WebSocket-соединением с Django Channels сигнальным сервером.
 * P2P медиапоток устанавливается напрямую между клиентом и психологом.
 */

export type SignalMessage =
  | { type: "offer"; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; sdp: RTCSessionDescriptionInit }
  | { type: "ice-candidate"; candidate: RTCIceCandidateInit }
  | { type: "ready" }
  | { type: "bye" }
  | { type: "peer-joined" }
  | { type: "peer-left" };

type MessageHandler = (msg: SignalMessage) => void;

export class SignalingClient {
  private ws: WebSocket | null = null;
  private handlers = new Set<MessageHandler>();
  private reconnectAttempts = 0;
  private readonly maxReconnects = 5;

  constructor(
    private readonly roomId: string,
    private readonly wsBaseUrl: string = (() => {
      // NEXT_PUBLIC_WS_URL — baked at build time for split deployments (Vercel + Railway)
      const envWs = process.env.NEXT_PUBLIC_WS_URL;
      if (envWs) return envWs.replace(/\/$/, "");
      if (typeof window === "undefined") return "ws://localhost";
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      return `${proto}://${window.location.host}`;
    })()
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${this.wsBaseUrl}/ws/signaling/${this.roomId}/`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as SignalMessage;
          this.handlers.forEach((h) => h(msg));
        } catch {
          // Игнорируем некорректные сообщения
        }
      };

      this.ws.onerror = () => reject(new Error("WebSocket connection failed"));

      this.ws.onclose = () => {
        if (this.reconnectAttempts < this.maxReconnects) {
          this.reconnectAttempts++;
          const delay = Math.pow(2, this.reconnectAttempts) * 500;
          setTimeout(() => this.connect(), delay);
        }
      };
    });
  }

  send(msg: Exclude<SignalMessage, { type: "peer-joined" | "peer-left" }>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.send({ type: "bye" });
    this.ws?.close();
    this.ws = null;
    this.handlers.clear();
  }
}
