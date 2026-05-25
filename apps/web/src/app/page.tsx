"use client";

import { useState } from "react";
import Link from "next/link";

const STATS = [
  { value: "0",   label: "байт ваших данных на сервере" },
  { value: "E2E", label: "шифрование сессий" },
  { value: "P2P", label: "видео без посредников" },
  { value: "24ч", label: "максимум хранения заметок" },
];

const PAIN = [
  { stat: "35%", label: "взрослых россиян", desc: "регулярно испытывают тревогу или депрессивные состояния" },
  { stat: "73%", label: "из тех, кому нужна помощь", desc: "откладывают её — главная причина: «что подумают окружающие»" },
  { stat: "5%",  label: "россиян за последний год", desc: "получили профессиональную психологическую помощь" },
];

const COMPETITORS = [
  { label: "ФИО + телефон",      comp: "Регистрация по паспорту, верификация по СМС", us: "Только SHA-256 хэш email" },
  { label: "Email + история",   comp: "Открытый текст, доступ любому сотруднику",    us: "Хэш. Оригинал нигде." },
  { label: "Видео сессий",       comp: "Запись на сервере, хранение до 5 лет",        us: "P2P — через сервер не проходит" },
  { label: "Аудиозаписи",        comp: "Транскрибация для AI-анализа",                us: "Не записываем" },
  { label: "Диагнозы / заметки", comp: "В открытом виде в CRM-системе",              us: "localStorage, удаляются через 24ч" },
];

const PILLARS = [
  {
    n: "01", title: "Zero-Knowledge ID",
    desc: "HMAC-SHA256 серверная соль. Никаких ФИО, телефонов, паспортов. Идентификация — это UUID, который мы не контролируем.",
    icon: "🔑",
  },
  {
    n: "02", title: "AI-маска лица",
    desc: "MediaPipe отслеживает 468 точек мимики в реальном времени прямо на вашем устройстве. Психолог видит эмоции — не лицо.",
    icon: "🎭",
  },
  {
    n: "03", title: "P2P WebRTC",
    desc: "Видеопоток идёт напрямую между участниками. Наш сервер — только посредник для инициации соединения. Видео не проходит через нас.",
    icon: "📡",
  },
  {
    n: "04", title: "Эфемерные данные",
    desc: "localStorage с TTL 24 часа. Заметки сессии хранятся только на вашем устройстве и автоматически удаляются.",
    icon: "⏳",
  },
];

const STEPS = [
  { n: "01", title: "Создайте анонимный профиль", desc: "Только хэш email — никакого имени, адреса, телефона. Регистрация занимает 30 секунд." },
  { n: "02", title: "Выберите специалиста",        desc: "Верифицированные консультанты с подтверждёнными дипломами. Каждый прошёл внутреннюю проверку." },
  { n: "03", title: "Войдите в защищённую комнату", desc: "P2P видео + AI-маска включаются автоматически. Говорите свободно — данных не существует." },
];

const FAQ_ITEMS = [
  {
    q: "Видит ли специалист моё настоящее лицо?",
    a: "Нет. AI-маска обрабатывается локально на вашем устройстве до отправки видеопотока. Специалист видит только анонимизированную маску с передачей эмоциональных паттернов.",
  },
  {
    q: "Что если интернет прервётся во время консультации?",
    a: "Платформа автоматически пытается восстановить соединение с экспоненциальной задержкой (до 30 секунд между попытками). Сессия не завершается принудительно — вы получите уведомление и можете продолжить.",
  },
  {
    q: "Как проверяются специалисты?",
    a: "Каждый специалист проходит ручную верификацию: мы проверяем дипломы об образовании, документы о повышении квалификации и опыт работы. Специалисты без подтверждённых документов не допускаются к практике.",
  },
  {
    q: "Можно ли провести консультацию без видео — только голосом?",
    a: "Да. Вы можете отключить камеру в любой момент. Аудио-консультации полностью поддерживаются и также не записываются на сервере.",
  },
  {
    q: "Что происходит с моими заметками после сессии?",
    a: "Заметки хранятся исключительно в localStorage вашего браузера и автоматически удаляются через 24 часа. Мы никогда не получаем к ним доступ — они физически не покидают ваше устройство.",
  },
  {
    q: "Как происходит оплата? Привязана ли она к моим данным?",
    a: "Оплата проходит через YooKassa. Мы получаем только факт успешной транзакции. Детали платёжной карты, ФИО плательщика и история транзакций нам недоступны.",
  },
  {
    q: "Могу ли я удалить аккаунт вместе со всеми данными?",
    a: "Да, в один клик из настроек профиля. При удалении аккаунта мы удаляем единственное, что хранили — SHA-256 хэш email. Восстановление невозможно, что является гарантией необратимости.",
  },
  {
    q: "Работает ли Aprosop на смартфоне?",
    a: "Да. Платформа работает в любом современном браузере — Safari, Chrome, Firefox — на iOS и Android. Установка приложения не требуется.",
  },
  {
    q: "Что такое Zero-Knowledge и почему это важно?",
    a: "Zero-Knowledge означает, что мы архитектурно не можем узнать, кто вы — даже если захотим, даже по решению суда. Мы не знаем вашего имени, не видели вашего лица и не имеем доступа к содержанию ваших разговоров.",
  },
  {
    q: "Чем Aprosop отличается от Yasno, Alter или Zigmund?",
    a: "Конкуренты хранят ФИО, телефон, историю сессий, записи разговоров и диагнозы. Aprosop создан по принципу privacy-first: мы строим продукт так, чтобы хранение данных было архитектурно невозможным — не как обещание, а как инженерный факт.",
  },
];

const TECH_TAGS = ["Zero Trust", "Zero Knowledge", "End-to-End Encrypted", "P2P WebRTC", "On-Device AI", "No Logs Policy", "RU-Hosted"];

function MaskSVG() {
  return (
    <svg viewBox="0 0 200 230" fill="none" style={{ width: "100%", maxWidth: 320, filter: "drop-shadow(0 0 60px rgba(77,166,255,0.25))" }}>
      <defs>
        <linearGradient id="heroMask" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4DA6FF"/>
          <stop offset="55%"  stopColor="#8B6CF8"/>
          <stop offset="100%" stopColor="#FF7B7B"/>
        </linearGradient>
        <radialGradient id="maskGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#4DA6FF" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#4DA6FF" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Glow background */}
      <ellipse cx="100" cy="100" rx="95" ry="110" fill="url(#maskGlow)"/>
      {/* Main mask body */}
      <ellipse cx="100" cy="115" rx="88" ry="105" fill="url(#heroMask)" opacity="0.92"/>
      {/* Eye left */}
      <ellipse cx="65" cy="95" rx="18" ry="13" fill="rgba(0,0,0,0.75)"/>
      {/* Eye right */}
      <ellipse cx="135" cy="95" rx="18" ry="13" fill="rgba(0,0,0,0.75)"/>
      {/* Mouth */}
      <rect x="78" y="140" width="44" height="12" rx="6" fill="rgba(0,0,0,0.65)"/>
      {/* Subtle rim light */}
      <ellipse cx="100" cy="115" rx="88" ry="105" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 14, overflow: "hidden", transition: "border-color 0.2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", textAlign: "left", padding: "20px 24px",
          background: "none", border: "none", cursor: "pointer", color: "#F0F4FF",
          fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 500,
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
        }}
      >
        <span>{q}</span>
        <span style={{
          fontSize: 20, color: "#4DA6FF", flexShrink: 0,
          transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s",
          lineHeight: 1,
        }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 20px", color: "#8A9BB8", fontSize: 14, lineHeight: 1.7 }}>
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: "#0C0F1A", minHeight: "100vh", color: "#F0F4FF", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── NAV — floating pill ──────────────────────── */}
      <nav style={{
        position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        padding: "0 12px 0 16px", height: 52, minWidth: 0,
        background: "rgba(12,15,26,0.82)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 9999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05) inset",
        whiteSpace: "nowrap",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginRight: 4 }}>
          <svg width="28" height="28" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ng" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4DA6FF"/>
                <stop offset="55%" stopColor="#8B6CF8"/>
                <stop offset="100%" stopColor="#FF7B7B"/>
              </linearGradient>
            </defs>
            <ellipse cx="256" cy="256" rx="220" ry="244" fill="url(#ng)"/>
            <ellipse cx="168" cy="214" rx="52" ry="38" fill="#0C0F1A" opacity="0.85"/>
            <ellipse cx="344" cy="214" rx="52" ry="38" fill="#0C0F1A" opacity="0.85"/>
            <rect x="196" y="318" width="120" height="36" rx="18" fill="#0C0F1A" opacity="0.78"/>
          </svg>
          <span style={{
            fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em",
            background: "linear-gradient(135deg,#4DA6FF,#8B6CF8,#FF7B7B)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>aprosop</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 2, alignItems: "center", padding: "0 6px" }}>
          <Link href="#how" style={{
            fontSize: 13, color: "#8A9BB8", textDecoration: "none",
            padding: "6px 12px", borderRadius: 9999,
            transition: "color 0.15s",
          }}>Как работает</Link>
          <Link href="/psychologists" style={{
            fontSize: 13, color: "#8A9BB8", textDecoration: "none",
            padding: "6px 12px", borderRadius: 9999,
          }}>Специалисты</Link>
          <Link href="#faq" style={{
            fontSize: 13, color: "#8A9BB8", textDecoration: "none",
            padding: "6px 12px", borderRadius: 9999,
          }}>FAQ</Link>
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link href="/login" style={{
            fontSize: 13, fontWeight: 500, color: "#8A9BB8", textDecoration: "none",
            padding: "7px 14px", borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.09)", background: "transparent",
          }}>Войти</Link>
          <Link href="/register" style={{
            fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none",
            padding: "8px 18px", borderRadius: 9999,
            background: "linear-gradient(135deg,#4DA6FF,#8B6CF8)",
            boxShadow: "0 4px 16px rgba(77,166,255,0.3)",
          }}>Начать</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "80px 32px 60px", maxWidth: 1100, margin: "0 auto",
        gap: 60,
      }}>
        <div style={{ flex: "1 1 480px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(77,166,255,0.08)", border: "1px solid rgba(77,166,255,0.2)",
            borderRadius: 9999, padding: "5px 14px", marginBottom: 32,
          }}>
            <span style={{ color: "#4DA6FF", fontSize: 8 }}>●</span>
            <span style={{ fontSize: 12, color: "#8A9BB8" }}>Beta · первые 100 клиентов — бесплатно</span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 12,
            color: "#F0F4FF",
          }}>
            Говори свободно.
          </h1>
          <h1 style={{
            fontSize: "clamp(2.2rem,5vw,3.6rem)", fontWeight: 700,
            lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 28,
            background: "linear-gradient(135deg,#4DA6FF 0%,#8B6CF8 55%,#FF7B7B 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Скрыли остальное.
          </h1>

          <p style={{ fontSize: 17, color: "#8A9BB8", lineHeight: 1.7, maxWidth: 480, marginBottom: 40 }}>
            Анонимная видео-консультация с AI-маской лица и Zero-Knowledge архитектурой.
            Специалист никогда не узнает ваше настоящее имя или лицо.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 60 }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: 12, textDecoration: "none",
              fontSize: 15, fontWeight: 600, color: "#fff",
              background: "linear-gradient(135deg,#4DA6FF,#8B6CF8)",
              boxShadow: "0 8px 24px rgba(77,166,255,0.3)",
            }}>
              Начать бесплатно
            </Link>
            <Link href="/register?role=psychologist" style={{
              display: "inline-flex", alignItems: "center",
              padding: "14px 28px", borderRadius: 12, textDecoration: "none",
              fontSize: 15, fontWeight: 500, color: "#F0F4FF",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              Я специалист →
            </Link>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", gap: 0, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden",
          }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                flex: "1 1 100px", padding: "18px 14px", textAlign: "center",
                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}>
                <div style={{
                  fontSize: 22, fontWeight: 700, marginBottom: 4,
                  background: "linear-gradient(135deg,#4DA6FF,#8B6CF8)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#4A5A72", lineHeight: 1.35 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: "0 0 320px", display: "flex", justifyContent: "center" }}>
          <MaskSVG />
        </div>
      </section>

      {/* ── PAIN ─────────────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4DA6FF", textTransform: "uppercase", marginBottom: 16 }}>
            Проблема
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 14 }}>
            Помощь нужна каждому третьему.
          </h2>
          <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 60, color: "#8A9BB8" }}>
            Идёт за ней — каждый двадцатый.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginBottom: 48 }}>
            {PAIN.map((p, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16, padding: "28px 24px", textAlign: "left",
              }}>
                <div style={{
                  fontSize: 42, fontWeight: 700, marginBottom: 8, lineHeight: 1,
                  background: "linear-gradient(135deg,#4DA6FF,#8B6CF8,#FF7B7B)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{p.stat}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF", marginBottom: 6 }}>{p.label}</div>
                <div style={{ fontSize: 13, color: "#8A9BB8", lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, color: "#4A5A72", fontStyle: "italic" }}>
            Между «мне нужна помощь» и «я пошёл за помощью» — пропасть из 30 млн взрослых россиян.
          </p>
        </div>
      </section>

      {/* ── PRIVACY COMPARISON ───────────────────────── */}
      <section style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4DA6FF", textTransform: "uppercase", marginBottom: 16 }}>
              Приватность
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>
              Ваш страх обоснован.
            </h2>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", color: "#FF7B7B" }}>
              Конкуренты хранят всё.
            </h2>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20, overflow: "hidden",
          }}>
            {/* Header row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}>
              <div style={{ fontSize: 12, color: "#4A5A72" }}>Данные</div>
              <div style={{ fontSize: 12, color: "#4A5A72", textAlign: "center" }}>
                <span style={{
                  background: "rgba(255,77,77,0.12)", color: "#FF7B7B",
                  border: "1px solid rgba(255,77,77,0.25)", borderRadius: 9999,
                  padding: "2px 10px", fontSize: 11,
                }}>ВЫСОКИЙ РИСК</span>
              </div>
              <div style={{ fontSize: 12, color: "#4DA6FF", textAlign: "right" }}>aprosop</div>
            </div>
            {COMPETITORS.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                padding: "16px 24px", alignItems: "center",
                borderBottom: i < COMPETITORS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ fontSize: 14, color: "#F0F4FF" }}>{row.label}</div>
                <div style={{ fontSize: 12, color: "#8A9BB8", textAlign: "center" }}>{row.comp}
                  <span style={{
                    display: "inline-block", marginLeft: 8,
                    background: "rgba(255,77,77,0.12)", color: "#FF7B7B",
                    border: "1px solid rgba(255,77,77,0.2)", borderRadius: 4,
                    padding: "1px 6px", fontSize: 10, fontWeight: 700,
                  }}>ПД</span>
                </div>
                <div style={{ fontSize: 12, color: "#31D97B", textAlign: "right" }}>✓ {row.us}</div>
              </div>
            ))}
            {/* Bottom highlight */}
            <div style={{
              padding: "18px 24px",
              background: "rgba(49,217,123,0.06)", borderTop: "1px solid rgba(49,217,123,0.15)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ color: "#31D97B", fontSize: 18 }}>✓</span>
              <span style={{ fontSize: 13, color: "#F0F4FF", fontWeight: 500 }}>
                Что хранит Aprosop: <span style={{ color: "#31D97B" }}>SHA-256 хэш email. Всё. Архитектурно нечего украсть.</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUR PILLARS ─────────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4DA6FF", textTransform: "uppercase", marginBottom: 16 }}>
              Продукт
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Четыре независимых уровня приватности
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
            {PILLARS.map((p, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "28px 24px",
                transition: "border-color 0.2s, transform 0.2s",
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                  color: "#4DA6FF", textTransform: "uppercase", marginBottom: 12,
                }}>{p.n}</div>
                <div style={{ fontSize: 24, marginBottom: 12 }}>{p.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: "#F0F4FF" }}>{p.title}</h3>
                <p style={{ fontSize: 13, color: "#8A9BB8", lineHeight: 1.65 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how" style={{ padding: "100px 32px", scrollMarginTop: 60 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4DA6FF", textTransform: "uppercase", marginBottom: 16 }}>
            Как работает
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 64 }}>
            Три шага до безопасной консультации
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 48, textAlign: "left" }}>
            {STEPS.map((s, i) => (
              <div key={i}>
                <div style={{
                  fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 16,
                  background: "linear-gradient(135deg,#4DA6FF,#8B6CF8,#FF7B7B)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0.6,
                }}>{s.n}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, color: "#F0F4FF" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#8A9BB8", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR PSYCHOLOGISTS ────────────────────────── */}
      <section style={{ background: "rgba(255,255,255,0.02)", padding: "100px 32px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4DA6FF", textTransform: "uppercase", marginBottom: 16 }}>
            Для специалистов
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Помогайте тем, кто боялся обратиться
          </h2>
          <p style={{ fontSize: 16, color: "#8A9BB8", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.7 }}>
            Aprosop открывает доступ к аудитории, которая никогда не пришла бы к психологу офлайн — из-за страха стигмы, огласки или утечки данных.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 40 }}>
            {["Гибкое расписание", "Аналитика сессий", "Выплата на карту", "Privacy-first аудитория"].map((item, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "16px", fontSize: 13, color: "#F0F4FF",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ color: "#31D97B" }}>✓</span> {item}
              </div>
            ))}
          </div>
          <Link href="/register?role=psychologist" style={{
            display: "inline-flex", alignItems: "center",
            padding: "14px 28px", borderRadius: 12, textDecoration: "none",
            fontSize: 15, fontWeight: 600, color: "#fff",
            background: "linear-gradient(135deg,#4DA6FF,#8B6CF8)",
            boxShadow: "0 8px 24px rgba(77,166,255,0.25)",
          }}>
            Стать специалистом Aprosop →
          </Link>
        </div>
      </section>

      {/* ── TECH TAGS ────────────────────────────────── */}
      <section style={{ padding: "64px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 13, color: "#4A5A72", marginBottom: 24 }}>Технологический стек</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {TECH_TAGS.map(tag => (
              <span key={tag} style={{
                display: "inline-block",
                background: "rgba(77,166,255,0.08)", border: "1px solid rgba(77,166,255,0.2)",
                borderRadius: 9999, padding: "6px 16px",
                fontSize: 12, color: "#4DA6FF",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section id="faq" style={{ background: "rgba(255,255,255,0.02)", padding: "100px 32px", scrollMarginTop: 60 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#4DA6FF", textTransform: "uppercase", marginBottom: 16 }}>
              Вопросы и ответы
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 700, letterSpacing: "-0.02em" }}>
              Нет лишних вопросов — только честные ответы
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section style={{ padding: "100px 32px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Твои эмоции.{" "}
            <span style={{
              background: "linear-gradient(135deg,#4DA6FF,#8B6CF8,#FF7B7B)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Не твоё лицо.</span>
          </h2>
          <p style={{ fontSize: 16, color: "#8A9BB8", marginBottom: 40, lineHeight: 1.7 }}>
            Первые 100 клиентов получают вводную консультацию бесплатно.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center",
              padding: "16px 36px", borderRadius: 14, textDecoration: "none",
              fontSize: 16, fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg,#4DA6FF,#8B6CF8)",
              boxShadow: "0 8px 32px rgba(77,166,255,0.35)",
            }}>
              Начать бесплатно
            </Link>
            <Link href="/psychologists" style={{
              display: "inline-flex", alignItems: "center",
              padding: "16px 36px", borderRadius: 14, textDecoration: "none",
              fontSize: 16, fontWeight: 600, color: "#F0F4FF",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            }}>
              Выбрать специалиста
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{
        background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "60px 32px 32px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Top row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>🎭</span>
                <span style={{
                  fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em",
                  background: "linear-gradient(135deg,#4DA6FF,#8B6CF8,#FF7B7B)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>aprosop</span>
              </div>
              <p style={{ fontSize: 13, color: "#4A5A72", lineHeight: 1.65, maxWidth: 240 }}>
                Анонимная платформа психологических консультаций. Zero-Knowledge архитектура.
              </p>
            </div>

            {/* Column 1 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F0F4FF", marginBottom: 16, letterSpacing: "0.04em" }}>Продукт</div>
              {["Как работает", "Специалисты", "FAQ", "Тарифы"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link href="#" style={{ fontSize: 13, color: "#4A5A72", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F0F4FF", marginBottom: 16, letterSpacing: "0.04em" }}>Компания</div>
              {["О нас", "Блог", "Вакансии", "Контакты"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link href="#" style={{ fontSize: 13, color: "#4A5A72", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>

            {/* Column 3 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F0F4FF", marginBottom: 16, letterSpacing: "0.04em" }}>Специалистам</div>
              {["Присоединиться", "Документы", "Выплаты", "Поддержка"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link href="#" style={{ fontSize: 13, color: "#4A5A72", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>

            {/* Column 4 */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#F0F4FF", marginBottom: 16, letterSpacing: "0.04em" }}>Поддержка</div>
              <div style={{ marginBottom: 10 }}>
                <a href="mailto:support@aprosop.ru" style={{ fontSize: 13, color: "#4A5A72", textDecoration: "none" }}>support@aprosop.ru</a>
              </div>
              {["Telegram-чат", "Статус системы", "Безопасность"].map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <Link href="#" style={{ fontSize: 13, color: "#4A5A72", textDecoration: "none" }}>{l}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16,
          }}>
            <span style={{ fontSize: 12, color: "#4A5A72" }}>© 2026 aprosop. Все права защищены.</span>
            <div style={{ display: "flex", gap: 24 }}>
              {["Политика конфиденциальности", "Условия использования", "Согласие на обработку данных"].map(l => (
                <Link key={l} href="#" style={{ fontSize: 12, color: "#4A5A72", textDecoration: "none" }}>{l}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
