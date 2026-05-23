"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export default function DashboardPage() {
  const [role, setRole]   = useState("");
  const [alias, setAlias] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { window.location.href = "/login"; return; }
    setRole(localStorage.getItem("role") ?? "client");
    setAlias(localStorage.getItem("alias") ?? "");
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const isPsych = role === "psychologist";

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginLeft: "auto" }}>
          <span className={`badge ${isPsych ? "badge-blue" : "badge-green"}`}>
            {isPsych ? "Психолог" : "Клиент"}
          </span>
          {alias && <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>#{alias.slice(0, 8)}</span>}
          <button onClick={logout} className="btn btn-ghost btn-sm">Выйти</button>
        </div>
      </nav>

      <div className="page">
        <div className="page-inner">
          <div style={{ marginBottom: "32px" }}>
            <h2>Добро пожаловать</h2>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
              {isPsych ? "Управляйте расписанием и принимайте клиентов" : "Забронируйте сессию или войдите в текущую"}
            </p>
          </div>

          <div className="grid-3" style={{ marginBottom: "24px" }}>
            <Link href="/sessions" style={{ textDecoration: "none" }}>
              <div className="card card-hover" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>📅</div>
                <h4 style={{ marginBottom: "6px" }}>Сессии</h4>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {isPsych ? "Предстоящие встречи с клиентами" : "Ваши консультации"}
                </p>
              </div>
            </Link>

            {!isPsych && (
              <Link href="/sessions/book" style={{ textDecoration: "none" }}>
                <div className="card card-hover" style={{ cursor: "pointer", borderColor: "rgba(36,129,204,0.3)" }}>
                  <div style={{ fontSize: "28px", marginBottom: "12px" }}>▶</div>
                  <h4 style={{ marginBottom: "6px" }}>Прямо сейчас</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Бесплатная пробная сессия</p>
                  <span className="badge badge-green" style={{ marginTop: "10px" }}>Бесплатно</span>
                </div>
              </Link>
            )}

            {!isPsych && (
              <Link href="/psychologists" style={{ textDecoration: "none" }}>
                <div className="card card-hover" style={{ cursor: "pointer" }}>
                  <div style={{ fontSize: "28px", marginBottom: "12px" }}>🔍</div>
                  <h4 style={{ marginBottom: "6px" }}>Специалисты</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Верифицированные психологи</p>
                </div>
              </Link>
            )}

            <div className="card">
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>🛡</div>
              <h4 style={{ marginBottom: "6px" }}>Анонимность</h4>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                Ваш ID хранится как SHA-256 хэш
              </p>
              <span className="badge badge-green" style={{ marginTop: "10px" }}>Zero Knowledge</span>
            </div>
          </div>

          {/* Privacy panel */}
          <div className="card" style={{ borderColor: "rgba(36,129,204,0.2)" }}>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { icon: "🔒", label: "E2E шифрование", ok: true },
                { icon: "🎭", label: "AI Face Mask", ok: true },
                { icon: "📡", label: "P2P видео", ok: true },
                { icon: "💾", label: "Хранение данных", ok: false, note: "0 байт" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>{item.icon}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.label}</span>
                  {item.note
                    ? <span className="badge badge-blue" style={{ fontSize: "11px" }}>{item.note}</span>
                    : <span style={{ color: "var(--success)", fontSize: "13px" }}>✓</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
