"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

interface Psychologist {
  id: string;
  display_name: string;
  bio: string;
  specializations: string[];
  languages: string[];
  session_rate_rub: string;
}

export default function PsychologistsPage() {
  const [list,    setList]    = useState<Psychologist[]>([]);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    if (!access) { window.location.href = "/login"; return; }
    fetch(`${API}/auth/psychologists/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setList(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setError("Не удалось загрузить список специалистов"))
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
            <h2>Специалисты</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
              Верифицированные психологи платформы
            </p>
          </div>

          {loading && <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Загрузка...</p>}
          {error   && <div className="form-error">{error}</div>}

          {!loading && !error && list.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
              <p style={{ color: "var(--text-secondary)" }}>Верифицированных специалистов пока нет</p>
            </div>
          )}

          <div className="grid-3">
            {list.map(p => (
              <div key={p.id} className="card card-hover">
                <h4 style={{ marginBottom: "8px" }}>{p.display_name}</h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.5 }}>
                  {p.bio || "Описание не указано"}
                </p>

                {p.specializations?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {p.specializations.map(s => (
                      <span key={s} className="badge">{s}</span>
                    ))}
                  </div>
                )}

                <p style={{ fontSize: "14px", color: "var(--accent)", fontWeight: 600, marginBottom: "14px" }}>
                  {p.session_rate_rub} ₽ / сессия
                </p>

                <Link href={`/sessions/book?psychologist=${p.id}`} className="btn btn-primary btn-sm btn-full">
                  Записаться
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
