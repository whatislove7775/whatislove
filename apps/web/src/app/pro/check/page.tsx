"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Headphones, Lamp, Mic, MicOff, RotateCw, Wifi } from "lucide-react";
import { Badge, Button, Card, CardHead } from "@/ui";
import { PageHeader, WithRail } from "@/components/shell/AppShell";
import c from "./check.module.css";

type State = "idle" | "asking" | "ok" | "error";

function explain(e: unknown): string {
  const name = (e as DOMException)?.name;
  if (name === "NotAllowedError" || name === "SecurityError")
    return "Браузер запретил доступ. Нажмите на\u00a0значок замка в\u00a0адресной строке, разрешите камеру и\u00a0микрофон, затем нажмите «Проверить снова».";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "Камера или\u00a0микрофон не\u00a0найдены. Подключите устройство и\u00a0нажмите «Проверить снова».";
  if (name === "NotReadableError" || name === "AbortError")
    return "Камера занята другой программой. Закройте Zoom, Teams или\u00a0другую вкладку со\u00a0звонком и\u00a0нажмите «Проверить снова».";
  if (typeof navigator !== "undefined" && !navigator.mediaDevices)
    return "Этот браузер не\u00a0даёт доступ к\u00a0камере. Откройте страницу в\u00a0свежей версии Chrome, Safari или\u00a0Firefox.";
  return "Не\u00a0получилось включить камеру и\u00a0микрофон. Нажмите «Проверить снова» или\u00a0перезапустите браузер.";
}

const BARS = 24;

export default function CheckPage() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<{ ctx: AudioContext; raf: number } | null>(null);
  const gen = useRef(0);
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [hasVideo, setHasVideo] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [labels, setLabels] = useState<{ cam?: string; mic?: string }>({});

  const stop = useCallback(() => {
    if (audio.current) {
      cancelAnimationFrame(audio.current.raf);
      audio.current.ctx.close().catch(() => {});
      audio.current = null;
    }
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }, []);

  const start = useCallback(async () => {
    stop();
    const my = ++gen.current;
    setState("asking");
    setError("");
    setPeak(0);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (my !== gen.current) {
        ms.getTracks().forEach((t) => t.stop()); // page left or a newer check started
        return;
      }
      stream.current = ms;
      const v = ms.getVideoTracks()[0];
      const a = ms.getAudioTracks()[0];
      setHasVideo(!!v);
      setHasAudio(!!a);
      setLabels({ cam: v?.label, mic: a?.label });
      if (video.current) {
        video.current.srcObject = ms;
        video.current.play().catch(() => {});
      }
      if (a) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const src = ctx.createMediaStreamSource(ms);
        const an = ctx.createAnalyser();
        an.fftSize = 1024;
        src.connect(an);
        const buf = new Float32Array(an.fftSize);
        const tick = () => {
          an.getFloatTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
          const rms = Math.sqrt(sum / buf.length);
          const l = Math.min(1, rms * 6);
          setLevel(l);
          setPeak((p) => Math.max(p, l));
          if (audio.current) audio.current.raf = requestAnimationFrame(tick);
        };
        audio.current = { ctx, raf: requestAnimationFrame(tick) };
      }
      setState("ok");
    } catch (e) {
      if (my !== gen.current) return;
      stop();
      setError(explain(e));
      setState("error");
    }
  }, [stop]);

  useEffect(() => {
    start();
    return () => {
      gen.current++;
      stop();
    };
  }, [start, stop]);

  const lit = Math.round(level * BARS);
  const micHeard = peak > 0.08;

  return (
    <>
      <PageHeader
        title="Проверка камеры и&nbsp;микрофона"
        sub="Клиент видит ваше настоящее видео"
        action={
          <Button variant="primary" icon={<RotateCw size={18} />} onClick={start} loading={state === "asking"}>
            Проверить снова
          </Button>
        }
      />
      <WithRail rail={<Tips />}>
        <Card as="section">
          <div className={c.stage}>
            <video ref={video} className={c.video} muted playsInline autoPlay data-on={state === "ok" && hasVideo ? true : undefined} />
            {state !== "ok" && (
              <div className={c.placeholder}>
                {state === "error" ? <CameraOff size={32} strokeWidth={1.6} /> : <Camera size={32} strokeWidth={1.6} />}
                <p>{state === "error" ? error : "Разрешите браузеру доступ к\u00a0камере и\u00a0микрофону"}</p>
              </div>
            )}
            <span className={c.private}>Так вас увидит клиент</span>
          </div>

          <div className={c.checks}>
            <div className={c.check}>
              <span className={c.checkIcon} data-ok={state === "ok" && hasVideo ? true : undefined}>
                {state === "ok" && hasVideo ? <Camera size={20} /> : <CameraOff size={20} />}
              </span>
              <div className={c.checkText}>
                <strong>Камера</strong>
                <span>{state === "ok" && hasVideo ? labels.cam || "Работает" : state === "asking" ? "Ждём разрешения" : "Не\u00a0подключена"}</span>
              </div>
              <Badge tone={state === "ok" && hasVideo ? "success" : state === "error" ? "danger" : "neutral"}>
                {state === "ok" && hasVideo ? "Работает" : state === "error" ? "Нет доступа" : "Проверяем"}
              </Badge>
            </div>
            <div className={c.check}>
              <span className={c.checkIcon} data-ok={micHeard || undefined}>
                {state === "ok" && hasAudio ? <Mic size={20} /> : <MicOff size={20} />}
              </span>
              <div className={c.checkText}>
                <strong>Микрофон</strong>
                <span>
                  {state === "ok" && hasAudio
                    ? micHeard
                      ? labels.mic || "Вас слышно"
                      : "Скажите что-нибудь, полоска должна ожить"
                    : state === "asking"
                      ? "Ждём разрешения"
                      : "Не\u00a0подключён"}
                </span>
              </div>
              <Badge tone={micHeard ? "success" : state === "error" ? "danger" : "warning"}>
                {micHeard ? "Вас слышно" : state === "error" ? "Нет доступа" : "Скажите пару слов"}
              </Badge>
            </div>
            <div className={c.meter} role="meter" aria-label="Громкость микрофона" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}>
              {Array.from({ length: BARS }, (_, i) => (
                <span key={i} data-on={i < lit || undefined} data-hot={i >= BARS - 4 || undefined} />
              ))}
            </div>
          </div>
        </Card>
      </WithRail>
    </>
  );
}

function Tips() {
  const tips = [
    { icon: <Lamp size={20} />, title: "Свет спереди", text: "Окно или\u00a0лампа за\u00a0камерой, а\u00a0не\u00a0за\u00a0спиной. Клиенту важно видеть ваше лицо и\u00a0мимику." },
    { icon: <Camera size={20} />, title: "Кадр и\u00a0фон", text: "Камера на\u00a0уровне глаз, лицо и\u00a0плечи в\u00a0кадре. Спокойный фон без\u00a0личных вещей и\u00a0документов." },
    { icon: <Headphones size={20} />, title: "Наушники", text: "Так клиент не\u00a0услышит эхо своего голоса, а\u00a0разговор не\u00a0будет слышен рядом с\u00a0вами." },
    { icon: <Wifi size={20} />, title: "Стабильная сеть", text: "Видео идёт напрямую между вами и\u00a0клиентом. Если связь слабая, закройте загрузки и\u00a0другие звонки." },
  ];
  return (
    <Card as="section">
      <CardHead title="Перед созвоном" />
      <ul className={c.tips}>
        {tips.map((t) => (
          <li key={t.title}>
            <span className={c.tipIcon} aria-hidden>
              {t.icon}
            </span>
            <div>
              <strong>{t.title}</strong>
              <p>{t.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
