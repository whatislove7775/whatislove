"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [alias, setAlias] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setAlias(localStorage.getItem("alias") ?? "");
    setRole(localStorage.getItem("role") ?? "");
    if (!localStorage.getItem("access")) {
      window.location.href = "/login";
    }
  }, []);

  function logout() {
    localStorage.clear();
    window.location.href = "/";
  }

  return (
    <>
      <style>{`
        .card { background: var(--chrome-800); border: 1px solid var(--chrome-600); padding: 1.5rem 2rem; }
        .nav-link { font-family: var(--font-heading); font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--chrome-400); text-decoration: none; padding: 0.5rem 1rem; border: 1px solid transparent; transition: all var(--transition-base); }
        .nav-link:hover { border-color: var(--chrome-500); color: var(--chrome-200); }
        .btn-logout { background: transparent; border: 1px solid var(--chrome-600); color: var(--chrome-500); font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.5rem 1rem; cursor: pointer; transition: all var(--transition-base); }
        .btn-logout:hover { border-color: #e07070; color: #e07070; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--chrome-900)", padding: "2rem" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem", borderBottom: "1px solid var(--chrome-700)", paddingBottom: "1rem" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", letterSpacing: "0.15em", color: "var(--accent-chrome)" }}>
            ANON PSY
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--chrome-500)" }}>
              {alias || "—"}
            </span>
            <button className="btn-logout" onClick={logout}>Выйти</button>
          </div>
        </header>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--chrome-400)", fontSize: "0.85rem", marginBottom: "2rem" }}>
            Роль: <span style={{ color: "var(--accent-chrome)" }}>{role === "psychologist" ? "Психолог" : "Клиент"}</span>
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            <div className="card">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", letterSpacing: "0.12em", color: "var(--chrome-200)", marginBottom: "0.75rem" }}>
                СЕССИИ
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-500)", marginBottom: "1rem" }}>
                Предстоящие и прошедшие консультации
              </p>
              <a href="/sessions" className="nav-link" style={{ display: "inline-block" }}>Перейти →</a>
            </div>

            {role !== "psychologist" && (
              <div className="card">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", letterSpacing: "0.12em", color: "var(--chrome-200)", marginBottom: "0.75rem" }}>
                  СПЕЦИАЛИСТЫ
                </h2>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-500)", marginBottom: "1rem" }}>
                  Найти верифицированного психолога
                </p>
                <a href="/psychologists" className="nav-link" style={{ display: "inline-block" }}>Перейти →</a>
              </div>
            )}

            <div className="card">
              <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", letterSpacing: "0.12em", color: "var(--chrome-200)", marginBottom: "0.75rem" }}>
                АНОНИМНОСТЬ
              </h2>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-500)" }}>
                Ваш email не хранится. Идентификатор — SHA-256 хеш.
                Видео P2P, сервер не получает медиапоток.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
