"use client";

import { useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export default function RegisterPage() {
  const [role, setRole]               = useState<"client" | "psychologist">("client");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio]                 = useState("");
  const [rate, setRate]               = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [done, setDone]               = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const url = role === "client" ? `${API}/auth/register/` : `${API}/auth/register/psychologist/`;
      const body: any = { email, password };
      if (role === "psychologist") {
        body.display_name     = displayName;
        body.bio              = bio;
        body.session_rate_rub = Number(rate);
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || JSON.stringify(data));
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
      </nav>
      <div className="page flex-center" style={{ padding: "24px" }}>
        <div className="form-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
          <h3 style={{ marginBottom: "8px" }}>Аккаунт создан</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "14px" }}>
            {role === "psychologist" ? "Ваш профиль отправлен на верификацию. Обычно это занимает до 24 часов." : "Можете войти и начать сессию."}
          </p>
          <Link href="/login" className="btn btn-primary btn-full">Войти</Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">Apro<span>sop</span></Link>
        <Link href="/login" className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}>Войти</Link>
      </nav>

      <div className="page flex-center" style={{ padding: "24px" }}>
        <div className="form-card" style={{ maxWidth: "460px" }}>
          <h2 style={{ marginBottom: "6px" }}>Создать аккаунт</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
            Email хранится как SHA-256 хэш — мы не знаем, кто вы
          </p>

          <div className="tabs" style={{ marginBottom: "24px" }}>
            <button className={`tab ${role === "client" ? "active" : ""}`} onClick={() => setRole("client")}>Клиент</button>
            <button className={`tab ${role === "psychologist" ? "active" : ""}`} onClick={() => setRole("psychologist")}>Психолог</button>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-field">
              <label>Email</label>
              <input type="email" placeholder="your@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
              <label>Пароль <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(мин. 8 символов)</span></label>
              <input type="password" placeholder="••••••••" value={password} minLength={8}
                onChange={e => setPassword(e.target.value)} required />
            </div>

            {role === "psychologist" && (
              <>
                <div className="form-field">
                  <label>Отображаемое имя</label>
                  <input placeholder="Имя, которое видят клиенты" value={displayName}
                    onChange={e => setDisplayName(e.target.value)} required />
                </div>
                <div className="form-field">
                  <label>О себе</label>
                  <textarea placeholder="Образование, опыт, специализация..." rows={3} value={bio}
                    onChange={e => setBio(e.target.value)} required />
                </div>
                <div className="form-field">
                  <label>Стоимость сессии (₽)</label>
                  <input type="number" placeholder="3000" value={rate}
                    onChange={e => setRate(e.target.value)} required />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "8px" }} disabled={loading}>
              {loading ? "Регистрация..." : "Создать аккаунт"}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
            Уже есть аккаунт? <Link href="/login">Войти</Link>
          </p>
        </div>
      </div>
    </>
  );
}
