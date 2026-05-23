"use client";

import { useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Неверный email или пароль");
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("role", data.role);
      localStorage.setItem("alias", data.alias ?? "");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
        <Link href="/register" className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }}>Регистрация</Link>
      </nav>

      <div className="page flex-center" style={{ padding: "24px" }}>
        <div className="form-card">
          <h2 style={{ marginBottom: "6px" }}>Войти</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px" }}>
            Данные хранятся только у вас
          </p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-field">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Пароль</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "8px" }} disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

          <div className="divider" />

          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
            Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </>
  );
}
