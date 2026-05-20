"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export default function RegisterPage() {
  const [tab, setTab] = useState<"client" | "psychologist">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = tab === "client"
        ? `${API}/auth/register/`
        : `${API}/auth/register/psychologist/`;

      const body = tab === "client"
        ? { email, password }
        : { email, password, display_name: displayName, bio, session_rate_rub: rate };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(Object.values(data).flat().join(" ") || "Ошибка регистрации");
      } else {
        setDone(data.detail ?? "Готово");
      }
    } catch {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .field { width: 100%; padding: 0.75rem 1rem; background: var(--chrome-800); border: 1px solid var(--chrome-600); color: var(--chrome-100); font-family: var(--font-body); font-size: 0.95rem; outline: none; transition: border-color var(--transition-base); }
        .field:focus { border-color: var(--accent-chrome); }
        .tab { flex: 1; padding: 0.6rem; background: transparent; border: 1px solid var(--chrome-600); color: var(--chrome-400); font-family: var(--font-heading); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all var(--transition-base); }
        .tab.active { background: var(--accent-chrome); border-color: var(--accent-chrome); color: var(--chrome-900); }
        .submit { width: 100%; padding: 0.85rem; background: transparent; border: 1px solid var(--accent-chrome); color: var(--accent-chrome); font-family: var(--font-heading); font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all var(--transition-base); }
        .submit:hover:not(:disabled) { background: var(--accent-chrome); color: var(--chrome-900); }
        .submit:disabled { opacity: 0.5; cursor: not-allowed; }
        label { font-family: var(--font-mono); font-size: 0.72rem; color: var(--chrome-500); letter-spacing: 0.05em; display: block; margin-bottom: 0.35rem; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--chrome-900)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", letterSpacing: "0.15em", color: "var(--accent-chrome)", textAlign: "center", marginBottom: "2rem" }}>
            РЕГИСТРАЦИЯ
          </h1>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <button className={`tab${tab === "client" ? " active" : ""}`} onClick={() => setTab("client")}>Клиент</button>
            <button className={`tab${tab === "psychologist" ? " active" : ""}`} onClick={() => setTab("psychologist")}>Психолог</button>
          </div>

          {done ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "var(--accent-chrome)", fontFamily: "var(--font-body)", marginBottom: "1.5rem" }}>{done}</p>
              <a href="/login" style={{ color: "var(--chrome-400)", fontFamily: "var(--font-heading)", fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
                Войти →
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div><label>Email</label><input className="field" type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div><label>Пароль (мин. 8 символов)</label><input className="field" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></div>

              {tab === "psychologist" && (
                <>
                  <div><label>Имя для отображения</label><input className="field" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required /></div>
                  <div><label>О себе</label><textarea className="field" rows={3} value={bio} onChange={e => setBio(e.target.value)} style={{ resize: "vertical" }} /></div>
                  <div><label>Стоимость сессии (₽)</label><input className="field" type="number" min="500" value={rate} onChange={e => setRate(e.target.value)} required /></div>
                </>
              )}

              {error && <p style={{ color: "#e07070", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{error}</p>}

              <button className="submit" type="submit" disabled={loading}>
                {loading ? "..." : "Создать аккаунт"}
              </button>
            </form>
          )}

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-400)" }}>
            Уже есть аккаунт?{" "}
            <a href="/login" style={{ color: "var(--accent-chrome)", textDecoration: "none" }}>Войти</a>
          </p>
        </div>
      </main>
    </>
  );
}
