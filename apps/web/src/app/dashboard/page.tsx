"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6)  return "Доброй ночи";
    if (h < 12) return "Доброе утро";
    if (h < 18) return "Добрый день";
    return "Добрый вечер";
  })();

  return (
    <div style={{ background: "#0C0F1A", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(12,15,26,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ fontSize: 18 }}>🎭</span>
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg,#4DA6FF,#8B6CF8,#FF7B7B)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>aprosop</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: isPsych ? "rgba(139,108,248,0.12)" : "rgba(49,217,123,0.1)",
            border: `1px solid ${isPsych ? "rgba(139,108,248,0.25)" : "rgba(49,217,123,0.2)"}`,
            borderRadius: 9999, padding: "3px 12px",
            fontSize: 12, fontWeight: 500,
            color: isPsych ? "#B49BFF" : "#31D97B",
          }}>
            {isPsych ? "Специалист" : "Клиент"}
          </span>
          {alias && (
            <span style={{ fontSize: 13, color: "#4A5A72", fontFamily: "JetBrains Mono, monospace" }}>
              #{alias.slice(0, 8)}
            </span>
          )}
          <button onClick={logout} style={{
            fontSize: 13, fontWeight: 500, color: "#8A9BB8",
            padding: "6px 14px", borderRadius: 8, cursor: "pointer",
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "Inter, sans-serif",
          }}>Выйти</button>
        </div>
      </nav>

      <div style={{ paddingTop: 60, maxWidth: 1100, margin: "0 auto", padding: "80px 32px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 13, color: "#4A5A72", marginBottom: 8 }}>
            {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 style={{
            fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700,
            letterSpacing: "-0.03em", color: "#F0F4FF", marginBottom: 6,
          }}>
            {greeting}.
          </h1>
          <p style={{ fontSize: 15, color: "#8A9BB8" }}>
            {isPsych ? "Управляйте расписанием и принимайте клиентов" : "Выберите специалиста или войдите в текущую консультацию"}
          </p>
        </div>

        {/* Privacy status bar */}
        <div style={{
          display: "flex", gap: 0, flexWrap: "wrap",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14, overflow: "hidden", marginBottom: 32,
        }}>
          {[
            { icon: "🔒", label: "E2E шифрование",  ok: true },
            { icon: "🎭", label: "AI Face Mask",     ok: true },
            { icon: "📡", label: "P2P видео",        ok: true },
            { icon: "💾", label: "Данных на сервере", note: "0 байт" },
          ].map((item, i, arr) => (
            <div key={i} style={{
              flex: "1 1 160px", padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 10,
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontSize: 13, color: "#8A9BB8" }}>{item.label}</span>
              {item.note
                ? <span style={{
                    marginLeft: "auto", fontSize: 11, fontWeight: 600,
                    background: "rgba(77,166,255,0.1)", color: "#4DA6FF",
                    border: "1px solid rgba(77,166,255,0.2)", borderRadius: 9999,
                    padding: "2px 8px",
                  }}>{item.note}</span>
                : <span style={{ marginLeft: "auto", color: "#31D97B", fontSize: 14 }}>✓</span>
              }
            </div>
          ))}
        </div>

        {/* Main cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          <Link href="/sessions" style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 20, padding: "28px 24px", cursor: "pointer",
              transition: "border-color 0.2s, transform 0.2s",
              height: "100%",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>📅</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F0F4FF", marginBottom: 8 }}>
                {isPsych ? "Расписание" : "Мои консультации"}
              </h3>
              <p style={{ fontSize: 13, color: "#8A9BB8", lineHeight: 1.6 }}>
                {isPsych ? "Предстоящие встречи с клиентами" : "История и предстоящие сессии"}
              </p>
            </div>
          </Link>

          {!isPsych && (
            <Link href="/sessions/book" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(77,166,255,0.06)", border: "1px solid rgba(77,166,255,0.2)",
                borderRadius: 20, padding: "28px 24px", cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                height: "100%",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(77,166,255,0.4)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(77,166,255,0.12)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(77,166,255,0.2)"; (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>▶</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F0F4FF", marginBottom: 8 }}>Начать сейчас</h3>
                <p style={{ fontSize: 13, color: "#8A9BB8", lineHeight: 1.6 }}>Бесплатная вводная консультация</p>
                <span style={{
                  display: "inline-block", marginTop: 14, fontSize: 11, fontWeight: 600,
                  background: "rgba(49,217,123,0.12)", color: "#31D97B",
                  border: "1px solid rgba(49,217,123,0.25)", borderRadius: 9999,
                  padding: "3px 10px",
                }}>Бесплатно</span>
              </div>
            </Link>
          )}

          {!isPsych && (
            <Link href="/psychologists" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "28px 24px", cursor: "pointer",
                transition: "border-color 0.2s, transform 0.2s",
                height: "100%",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.transform = "none"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F0F4FF", marginBottom: 8 }}>Специалисты</h3>
                <p style={{ fontSize: 13, color: "#8A9BB8", lineHeight: 1.6 }}>Верифицированные консультанты</p>
              </div>
            </Link>
          )}

          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, padding: "28px 24px",
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🛡</div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#F0F4FF", marginBottom: 8 }}>Анонимность</h3>
            <p style={{ fontSize: 13, color: "#8A9BB8", lineHeight: 1.6 }}>
              Ваш ID: SHA-256 хэш. Мы не знаем, кто вы.
            </p>
            <span style={{
              display: "inline-block", marginTop: 14, fontSize: 11, fontWeight: 600,
              background: "rgba(77,166,255,0.1)", color: "#4DA6FF",
              border: "1px solid rgba(77,166,255,0.2)", borderRadius: 9999,
              padding: "3px 10px",
            }}>Zero Knowledge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
