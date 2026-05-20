"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

interface Session {
  id: string;
  webrtc_room_id: string;
  status: string;
  scheduled_at: string;
  duration_minutes: number;
  amount_kopecks: number;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачена",
  active: "Идёт",
  completed: "Завершена",
  cancelled: "Отменена",
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) { window.location.href = "/login"; return; }
    fetch(`${API}/sessions/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setSessions(Array.isArray(data) ? data : data.results ?? []))
      .catch(() => setError("Не удалось загрузить сессии"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        .row { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border: 1px solid var(--chrome-700); background: var(--chrome-800); gap: 1rem; flex-wrap: wrap; }
        .row:hover { border-color: var(--chrome-500); }
        .status { font-family: var(--font-mono); font-size: 0.7rem; padding: 0.2rem 0.6rem; border: 1px solid var(--chrome-600); color: var(--chrome-400); }
        .status.active { border-color: var(--accent-chrome); color: var(--accent-chrome); }
        .btn { padding: 0.5rem 1.2rem; border: 1px solid var(--accent-chrome); color: var(--accent-chrome); font-family: var(--font-heading); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all var(--transition-base); }
        .btn:hover { background: var(--accent-chrome); color: var(--chrome-900); }
        .back { font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--chrome-500); text-decoration: none; text-transform: uppercase; }
        .back:hover { color: var(--chrome-200); }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--chrome-900)", padding: "2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <a href="/dashboard" className="back">← Назад</a>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", letterSpacing: "0.15em", color: "var(--accent-chrome)" }}>
              МОИ СЕССИИ
            </h1>
          </div>

          {loading && <p style={{ color: "var(--chrome-500)", fontFamily: "var(--font-mono)" }}>Загрузка...</p>}
          {error && <p style={{ color: "#e07070", fontFamily: "var(--font-mono)" }}>{error}</p>}

          {!loading && !error && sessions.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p style={{ color: "var(--chrome-500)", fontFamily: "var(--font-body)", marginBottom: "1.5rem" }}>
                Сессий пока нет
              </p>
              <a href="/psychologists" style={{ padding: "0.75rem 2rem", border: "1px solid var(--accent-chrome)", color: "var(--accent-chrome)", fontFamily: "var(--font-heading)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                Найти специалиста
              </a>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sessions.map(s => (
              <div key={s.id} className="row">
                <div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--chrome-300)", marginBottom: "0.25rem" }}>
                    {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("ru-RU") : "Дата не указана"}
                  </p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-500)" }}>
                    {s.duration_minutes} мин · {(s.amount_kopecks / 100).toLocaleString("ru-RU")} ₽
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className={`status${s.status === "active" ? " active" : ""}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  {(s.status === "paid" || s.status === "active") && (
                    <a href={`/session/${s.webrtc_room_id}?role=client`} className="btn">
                      Войти →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
