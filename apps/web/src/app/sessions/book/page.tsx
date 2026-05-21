"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

interface Psychologist { id: string; display_name: string; session_rate_rub: string; }
interface BookedSession { webrtc_room_id: string; id: string; }

export default function BookSessionPage() {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [psychologistId, setPsychologistId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState("50");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<BookedSession | null>(null);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) { window.location.href = "/login"; return; }
    const fromUrl = new URLSearchParams(window.location.search).get("psychologist") ?? "";
    fetch(`${API}/auth/psychologists/`, { headers: { Authorization: `Bearer ${access}` } })
      .then(r => r.ok ? r.json() : [])
      .then((list: Psychologist[]) => {
        setPsychologists(list);
        setPsychologistId(fromUrl || (list[0]?.id ?? ""));
      }).catch(() => {});
  }, []);

  async function submit(isTest: boolean) {
    setError("");
    if (!psychologistId) { setError("Выберите специалиста"); return; }
    setLoading(true);
    try {
      const access = localStorage.getItem("access");
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
    const clientUrl = `${window.location.origin}/session/${booked.webrtc_room_id}?role=client`;
    const psychUrl = `${window.location.origin}/session/${booked.webrtc_room_id}?role=psychologist`;
    return (
      <>
        <style>{`
          .link-box { background: var(--chrome-800); border: 1px solid var(--chrome-600); padding: 0.75rem 1rem; font-family: var(--font-mono); font-size: 0.75rem; color: var(--chrome-300); word-break: break-all; margin-top: 0.4rem; }
          .btn { display: inline-block; padding: 0.7rem 1.5rem; border: 1px solid var(--accent-chrome); color: var(--accent-chrome); font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; cursor: pointer; background: transparent; transition: all var(--transition-base); }
          .btn:hover { background: var(--accent-chrome); color: var(--chrome-900); }
        `}</style>
        <main style={{ minHeight: "100vh", background: "var(--chrome-900)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ maxWidth: "500px", width: "100%" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", letterSpacing: "0.15em", color: "var(--accent-chrome)", marginBottom: "2rem" }}>
              СЕССИЯ СОЗДАНА
            </h1>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--chrome-500)", marginBottom: "0.4rem" }}>Ссылка клиента:</p>
            <div className="link-box">{clientUrl}</div>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
              <a href={clientUrl} className="btn">Войти как клиент</a>
              <button className="btn" onClick={() => navigator.clipboard.writeText(clientUrl)}>Скопировать</button>
            </div>

            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--chrome-500)", marginBottom: "0.4rem", marginTop: "1.5rem" }}>Ссылка психолога (другой браузер / вкладка):</p>
            <div className="link-box">{psychUrl}</div>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
              <a href={psychUrl} target="_blank" rel="noreferrer" className="btn">Открыть</a>
              <button className="btn" onClick={() => navigator.clipboard.writeText(psychUrl)}>Скопировать</button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{`
        .field { width: 100%; padding: 0.75rem 1rem; background: var(--chrome-800); border: 1px solid var(--chrome-600); color: var(--chrome-100); font-family: var(--font-body); font-size: 0.95rem; outline: none; transition: border-color var(--transition-base); }
        .field:focus { border-color: var(--accent-chrome); }
        select.field option { background: var(--chrome-800); }
        .submit { flex: 1; padding: 0.85rem; background: transparent; border: 1px solid var(--accent-chrome); color: var(--accent-chrome); font-family: var(--font-heading); font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all var(--transition-base); }
        .submit:hover:not(:disabled) { background: var(--accent-chrome); color: var(--chrome-900); }
        .submit.test { border-color: var(--chrome-400); color: var(--chrome-400); }
        .submit.test:hover:not(:disabled) { background: var(--chrome-400); color: var(--chrome-900); }
        .submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .back { font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--chrome-500); text-decoration: none; text-transform: uppercase; }
        label { font-family: var(--font-mono); font-size: 0.75rem; color: var(--chrome-400); letter-spacing: 0.05em; display: block; margin-bottom: 0.4rem; }
      `}</style>
      <main style={{ minHeight: "100vh", background: "var(--chrome-900)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <a href="/psychologists" className="back" style={{ display: "inline-block", marginBottom: "2rem" }}>← Назад</a>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem", letterSpacing: "0.15em", color: "var(--accent-chrome)", marginBottom: "2rem" }}>ЗАПИСЬ</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label>Специалист</label>
              <select className="field" value={psychologistId} onChange={e => setPsychologistId(e.target.value)}>
                {psychologists.length === 0 && <option value="">Нет доступных специалистов</option>}
                {psychologists.map(p => <option key={p.id} value={p.id}>{p.display_name} — {p.session_rate_rub} ₽</option>)}
              </select>
            </div>
            <div>
              <label>Дата и время</label>
              <input className="field" type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            </div>
            <div>
              <label>Длительность</label>
              <select className="field" value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="50">50 минут</option>
                <option value="80">80 минут</option>
                <option value="100">100 минут</option>
              </select>
            </div>

            {error && <p style={{ color: "#e07070", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{error}</p>}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="submit" onClick={() => submit(false)} disabled={loading || !psychologistId}>
                {loading ? "..." : "Подтвердить"}
              </button>
              <button className="submit test" onClick={() => submit(true)} disabled={loading || !psychologistId}>
                ▶ Right Now
              </button>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--chrome-600)", textAlign: "center" }}>
              «Right Now» — бесплатная тест-сессия, начинается немедленно
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
