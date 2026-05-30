"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

interface Psychologist { id: string; display_name: string; session_rate_rub: string; }
interface BookedSession { webrtc_room_id: string; id: string; }

export default function BookSessionPage() {
  const [psychologists,  setPsychologists]  = useState<Psychologist[]>([]);
  const [psychologistId, setPsychologistId] = useState("");
  const [scheduledAt,    setScheduledAt]    = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState("50");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [booked,   setBooked]   = useState<BookedSession | null>(null);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) { window.location.href = "/login"; return; }
    const fromUrl = new URLSearchParams(window.location.search).get("psychologist") ?? "";
    fetch(`${API}/auth/psychologists/`, { headers: { Authorization: `Bearer ${access}` } })
      .then(r => r.ok ? r.json() : [])
      .then((data: any) => {
        const list: Psychologist[] = Array.isArray(data) ? data : (data.results ?? []);
        setPsychologists(list);
        setPsychologistId(fromUrl || (list[0]?.id ?? ""));
      }).catch(() => {});
  }, []);

  async function submit(isTest: boolean) {
    setError("");
    if (!psychologistId) { setError("Выберите специалиста"); return; }
    setLoading(true);
    try {
      const access = localStorage.getItem("access_token");
      const res = await fetch(`${API}/sessions/book/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
        body: JSON.stringify({
          psychologist_profile_id: psychologistId,
          scheduled_at: isTest ? new Date().toISOString() : new Date(scheduledAt).toISOString(),
          duration_minutes: parseInt(duration),
          is_test: isTest,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(Object.values(data).flat().join(" ") || "Ошибка"); return; }
      setBooked(data);
    } catch { setError("Сервер недоступен"); }
    finally { setLoading(false); }
  }

  if (booked) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const clientUrl = `${origin}/session/${booked.webrtc_room_id}?role=client`;
    const psychUrl  = `${origin}/session/${booked.webrtc_room_id}?role=psychologist`;
    return (
      <>
        <nav className="nav">
          <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
        </nav>
        <div className="page flex-center" style={{ padding: "24px" }}>
          <div className="form-card" style={{ maxWidth: "520px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✓</div>
            <h3 style={{ marginBottom: "20px" }}>Сессия создана</h3>

            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Ссылка клиента:</p>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 12px", fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-all", marginBottom: "8px" }}>
                {clientUrl}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href={clientUrl} className="btn btn-primary btn-sm">Войти как клиент</Link>
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(clientUrl)}>Скопировать</button>
              </div>
            </div>

            <div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Ссылка психолога:</p>
              <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 12px", fontSize: "12px", color: "var(--text-secondary)", wordBreak: "break-all", marginBottom: "8px" }}>
                {psychUrl}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href={psychUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Открыть</a>
                <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(psychUrl)}>Скопировать</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
        <Link href="/psychologists" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>← Назад</Link>
      </nav>

      <div className="page flex-center" style={{ padding: "24px" }}>
        <div className="form-card" style={{ maxWidth: "420px" }}>
          <h2 style={{ marginBottom: "6px" }}>Запись на сессию</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px" }}>
            Выберите специалиста и удобное время
          </p>

          {error && <div className="form-error">{error}</div>}

          <div className="form-field">
            <label>Специалист</label>
            <select value={psychologistId} onChange={e => setPsychologistId(e.target.value)}>
              {psychologists.length === 0 && <option value="">Нет доступных специалистов</option>}
              {psychologists.map(p => (
                <option key={p.id} value={p.id}>{p.display_name} — {p.session_rate_rub} ₽</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label>Дата и время</label>
            <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Длительность</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}>
              <option value="50">50 минут</option>
              <option value="80">80 минут</option>
              <option value="100">100 минут</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button className="btn btn-primary" style={{ flex: 1 }}
              onClick={() => submit(false)} disabled={loading || !psychologistId}>
              {loading ? "Создаём..." : "Подтвердить"}
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }}
              onClick={() => submit(true)} disabled={loading || !psychologistId}>
              ▶ Прямо сейчас
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", marginTop: "10px" }}>
            «Прямо сейчас» — бесплатная тест-сессия
          </p>
        </div>
      </div>
    </>
  );
}
