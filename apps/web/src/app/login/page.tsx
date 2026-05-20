"use client";

import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Неверный email или пароль");
      } else {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("role", data.role ?? "");
        localStorage.setItem("alias", data.alias ?? "");
        window.location.href = "/dashboard";
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
        .submit { width: 100%; padding: 0.85rem; background: transparent; border: 1px solid var(--accent-chrome); color: var(--accent-chrome); font-family: var(--font-heading); font-size: 0.85rem; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all var(--transition-base); }
        .submit:hover:not(:disabled) { background: var(--accent-chrome); color: var(--chrome-900); }
        .submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "var(--chrome-900)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.8rem", letterSpacing: "0.15em", color: "var(--accent-chrome)", textAlign: "center", marginBottom: "2rem" }}>
            ВХОД
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input className="field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="field" type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />

            {error && <p style={{ color: "#e07070", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>{error}</p>}

            <button className="submit" type="submit" disabled={loading}>
              {loading ? "..." : "Войти"}
            </button>
          </form>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--chrome-400)" }}>
            Нет аккаунта?{" "}
            <a href="/register" style={{ color: "var(--accent-chrome)", textDecoration: "none" }}>Зарегистрироваться</a>
          </p>
        </div>
      </main>
    </>
  );
}
