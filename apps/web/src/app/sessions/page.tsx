"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  pending:   "Ожидает оплаты",
  paid:      "Оплачена",
  active:    "Идёт",
  completed: "Завершена",
  cancelled: "Отменена",
};

const STATUS_BADGE: Record<string, string> = {
  pending:   "badge",
  paid:      "badge badge-blue",
  active:    "badge badge-green",
  completed: "badge",
  cancelled: "badge",
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [role,     setRole]     = useState("client");

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) { window.location.href = "/login"; return; }
    setRole(localStorage.getItem("role") ?? "client");
    fetch(`${API}/sessions/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setSessions(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setError("Не удалось загрузить сессии"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
        <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>← Назад</Link>
      </nav>

      <div className="page">
        <div className="page-inner">
          <div style={{ marginBottom: "28px" }}>
            <h2>Мои сессии</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
              {role === "psychologist" ? "Встречи с вашими клиентами" : "Ваши консультации с психологами"}
            </p>
          </div>

          {loading && <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Загрузка...</p>}
          {error   && <div className="form-error">{error}</div>}

          {!loading && !error && sessions.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>Сессий пока нет</p>
              {role !== "psychologist" && (
                <Link href="/sessions/book" className="btn btn-primary">Забронировать сессию</Link>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sessions.map(s => (
              <div key={s.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontSize: "14px", marginBottom: "4px" }}>
                    {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("ru-RU") : "Дата не указана"}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {s.duration_minutes} мин
                    {s.amount_kopecks > 0 && ` · ${(s.amount_kopecks / 100).toLocaleString("ru-RU")} ₽`}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={STATUS_BADGE[s.status] ?? "badge"}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                  {(s.status === "paid" || s.status === "active") && s.webrtc_room_id && (
                    <Link
                      href={`/session/${s.webrtc_room_id}?role=${role}`}
                      className="btn btn-primary btn-sm"
                    >
                      Войти →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
