"use client";

import { useEffect, useState } from "react";

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
  const [list, setList] = useState<Psychologist[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) { window.location.href = "/login"; return; }
    fetch(`${API}/auth/psychologists/`, {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setList)
      .catch(() => setError("Не удалось загрузить список специалистов"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{`
        .card { background: var(--chrome-800); border: 1px solid var(--chrome-600); padding: 1.5rem; transition: border-color var(--transition-base); }
        .card:hover { border-color: var(--accent-chrome); }
        .tag { display: inline-block; padding: 0.2rem 0.6rem; background: var(--chrome-700); border: 1px solid var(--chrome-600); color: var(--chrome-300); font-family: var(--font-mono); font-size: 0.7rem; margin: 0.2rem 0.2rem 0 0; }
        .btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1.4rem; border: 1px solid var(--accent-chrome); color: var(--accent-chrome); font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: all var(--transition-base); cursor: pointer; background: transparent; }
        .btn:hover { background: var(--accent-chrome); color: var(--chrome-900); }
        .back { font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--chrome-500); text-decoration: none; text-transform: uppercase; }
        .back:hover { color: var(--chrome-200); }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--chrome-900)", padding: "2rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <a href="/dashboard" className="back">← Назад</a>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", letterSpacing: "0.15em", color: "var(--accent-chrome)" }}>
              СПЕЦИАЛИСТЫ
            </h1>
          </div>

          {loading && <p style={{ color: "var(--chrome-500)", fontFamily: "var(--font-mono)" }}>Загрузка...</p>}
          {error && <p style={{ color: "#e07070", fontFamily: "var(--font-mono)" }}>{error}</p>}

          {!loading && !error && list.length === 0 && (
            <p style={{ color: "var(--chrome-500)", fontFamily: "var(--font-body)" }}>
              Верифицированных специалистов пока нет.
            </p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {list.map(p => (
              <div key={p.id} className="card">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", letterSpacing: "0.1em", color: "var(--chrome-100)", marginBottom: "0.5rem" }}>
                  {p.display_name}
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-400)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                  {p.bio || "Описание не указано"}
                </p>
                <div style={{ marginBottom: "0.5rem" }}>
                  {p.specializations.map(s => <span key={s} className="tag">{s}</span>)}
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent-chrome)", marginTop: "0.75rem" }}>
                  {p.session_rate_rub} ₽ / сессия
                </p>
                <a href={`/sessions/book?psychologist=${p.id}`} className="btn">
                  Записаться
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
