"use client";

import Link from "next/link";

const FEATURES = [
  {
    icon: "🎭",
    title: "AI-маска лица",
    desc: "MediaPipe отслеживает 468 точек мимики в реальном времени. Психолог видит твои эмоции — не лицо.",
  },
  {
    icon: "🔗",
    title: "P2P видео",
    desc: "WebRTC соединяет вас напрямую. Ни один байт видеопотока не проходит через наши серверы.",
  },
  {
    icon: "🔒",
    title: "Zero Knowledge",
    desc: "Email хранится как SHA-256 хэш. Украсть нечего — мы архитектурно лишены доступа к вашим данным.",
  },
  {
    icon: "🌿",
    title: "Звуки природы",
    desc: "Фоновые звуки дождя или леса усиливаются в паузах разговора. Снижают тревогу, создают атмосферу.",
  },
  {
    icon: "📝",
    title: "Блокнот сессии",
    desc: "Пишите заметки прямо во время разговора. Автоматически удаляются через 24 часа.",
  },
  {
    icon: "🫁",
    title: "Дыхательный синхронизатор",
    desc: "Упражнение «подышать» в стиле Apple Watch. Запускается в один клик при нарастании тревоги.",
  },
  {
    icon: "🧠",
    title: "Сетка эмоций",
    desc: "Для психологов: AI выделяет мышцы лица, связанные с конкретными эмоциями, цветовой сеткой.",
  },
  {
    icon: "🦋",
    title: "Кастомный аватар",
    desc: "Выбери персонажа-маску из галереи или загрузи свою. Полная смена визуальной идентичности.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Создай анонимный профиль",
    desc: "Только хэш email — никакого имени, адреса, телефона. Регистрация занимает 30 секунд.",
  },
  {
    n: "02",
    title: "Выбери специалиста",
    desc: "Верифицированные психологи с образованием и опытом. Каждый прошёл внутреннюю проверку.",
  },
  {
    n: "03",
    title: "Войди в защищённую комнату",
    desc: "P2P видео + AI-маска включаются автоматически. Говори свободно — данных не существует.",
  },
];

const STATS = [
  { value: "0", label: "байт ваших данных на сервере" },
  { value: "E2E", label: "шифрование сессий" },
  { value: "P2P", label: "видео без посредников" },
  { value: "24ч", label: "максимум хранения заметок" },
];

export default function LandingPage() {
  return (
    <>
      {/* ── NAV ──────────────────────────────────────────── */}
      <nav className="nav">
        <span className="nav-logo">Apro<span>sop</span></span>
        <Link href="#features" className="nav-item" style={{ display: "none" }}>Возможности</Link>
        <Link href="#how" className="nav-item" style={{ display: "none" }}>Как работает</Link>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Link href="/login" className="nav-item">Войти</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Начать</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 60px", textAlign: "center",
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(36,129,204,0.12) 0%, transparent 70%)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Grid bg */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />

        <div className="badge badge-blue" style={{ marginBottom: "24px", fontSize: "12px" }}>
          <span>●</span> Beta — первые 100 клиентов бесплатно
        </div>

        <h1 style={{ maxWidth: "760px", marginBottom: "20px" }}>
          Говори свободно.<br />
          <span style={{ color: "var(--accent)" }}>Мы скрыли всё остальное.</span>
        </h1>

        <p style={{ fontSize: "17px", color: "var(--text-secondary)", maxWidth: "540px", marginBottom: "40px", lineHeight: 1.65 }}>
          Анонимная психологическая помощь с AI-маской лица и Zero Knowledge архитектурой.
          Твой психолог никогда не узнает твоё настоящее имя или лицо.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginBottom: "64px" }}>
          <Link href="/register" className="btn btn-primary btn-lg">
            Начать — это бесплатно
          </Link>
          <Link href="/register?role=psychologist" className="btn btn-secondary btn-lg">
            Я психолог
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", gap: "0", flexWrap: "wrap", justifyContent: "center",
          background: "var(--bg-card)", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", overflow: "hidden", maxWidth: "640px", width: "100%",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              flex: "1 1 140px", padding: "20px 16px", textAlign: "center",
              borderRight: i < STATS.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent)", marginBottom: "4px" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "var(--bg-secondary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "12px" }}>
            Проблема
          </p>
          <h2 style={{ marginBottom: "16px" }}>Почему люди не идут к психологу?</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "480px", margin: "0 auto 48px" }}>
            Не потому что не нужно. А потому что страшно.
          </p>
          <div className="grid-3" style={{ maxWidth: "860px", margin: "0 auto" }}>
            {[
              { icon: "👁", stat: "73%", text: "откладывают помощь из-за страха, что кто-то из окружения узнает" },
              { icon: "💾", stat: "11ч", text: "— как часто происходят утечки медицинских данных в мире" },
              { icon: "🎙", stat: "∞", text: "лет могут храниться записи голоса и видео на серверах платформ" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ textAlign: "left", padding: "24px" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--danger)", marginBottom: "8px" }}>{item.stat}</div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ─────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", maxWidth: "900px", margin: "0 auto" }}>
            <div>
              <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "12px" }}>
                Решение
              </p>
              <h2 style={{ marginBottom: "20px" }}>Aprosop построен так, чтобы не знать ничего о вас</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.7 }}>
                Это не просто обещание. Это архитектурный факт. Мы физически не можем получить доступ к вашим данным — потому что их не существует в привычном виде.
              </p>
              {[
                { label: "Zero Knowledge", desc: "Email → SHA-256 хэш. Оригинал нигде не хранится." },
                { label: "P2P WebRTC", desc: "Видеопоток идёт напрямую между вами. Сервер — только посредник для соединения." },
                { label: "AI Face Mask", desc: "MediaPipe заменяет лицо маской на вашем устройстве до отправки." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: "2px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)", padding: "28px",
                boxShadow: "var(--shadow-lg)",
              }}>
                <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px", fontFamily: "var(--font-mono)" }}>
                  Архитектура данных
                </div>
                {[
                  { label: "Ваш email", value: "sha256(salt+email)", safe: true },
                  { label: "Ваше лицо", value: "AI маска (локально)", safe: true },
                  { label: "Видеопоток", value: "P2P → не сервер", safe: true },
                  { label: "Заметки", value: "localStorage 24ч", safe: true },
                  { label: "Голос", value: "модуляция (опц.)", safe: true },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.label}</span>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--success)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 24px", background: "var(--bg-secondary)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "12px" }}>
            Возможности
          </p>
          <h2 style={{ marginBottom: "12px" }}>Технологии на службе эмпатии</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto 48px" }}>
            AI не заменяет психолога — он снимает страх, который мешал к нему обратиться.
          </p>
          <div className="grid-2" style={{ textAlign: "left" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card card-hover" style={{ display: "flex", gap: "16px" }}>
                <div style={{ fontSize: "28px", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>{f.icon}</div>
                <div>
                  <h4 style={{ marginBottom: "6px" }}>{f.title}</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" style={{ padding: "80px 24px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "12px" }}>
            Как работает
          </p>
          <h2 style={{ marginBottom: "48px" }}>Три шага до безопасного разговора</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: "left" }}>
                <div style={{ fontSize: "42px", fontWeight: 700, color: "var(--accent)", opacity: 0.4, fontVariantNumeric: "tabular-nums", marginBottom: "12px", lineHeight: 1 }}>
                  {step.n}
                </div>
                <h3 style={{ marginBottom: "8px" }}>{step.title}</h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR PSYCHOLOGISTS ────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--accent)", textTransform: "uppercase", marginBottom: "12px" }}>
              Для психологов
            </p>
            <h2 style={{ marginBottom: "16px" }}>Помогайте тем, кто боялся обратиться</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "36px", lineHeight: 1.7 }}>
              Присоединяйтесь к сети верифицированных специалистов. Aprosop открывает доступ к аудитории, которая никогда бы не пришла к психологу офлайн.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "16px", marginBottom: "36px" }}>
              {[
                { icon: "✓", text: "Гибкое расписание" },
                { icon: "✓", text: "Сетка эмоций для диагностики" },
                { icon: "✓", text: "Заметки по каждой сессии" },
                { icon: "✓", text: "Выплата на карту" },
              ].map((item, i) => (
                <div key={i} className="card" style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", padding: "14px" }}>
                  <span style={{ color: "var(--success)", fontWeight: 700 }}>{item.icon}</span>
                  <span style={{ fontSize: "13px" }}>{item.text}</span>
                </div>
              ))}
            </div>
            <Link href="/register?role=psychologist" className="btn btn-primary btn-lg">
              Стать специалистом Aprosop
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST ────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "16px" }}>«Мировой стандарт приватности в Mental Health»</h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto 48px", lineHeight: 1.7 }}>
            Мы строим будущее, в котором терапия становится полностью изолированным ритуалом — недосягаемым для утечек данных, социальных ярлыков и чужих глаз.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {["Zero Trust", "Zero Knowledge", "End-to-End Encrypted", "P2P WebRTC", "On-Device AI", "No Logs"].map(tag => (
              <span key={tag} className="badge badge-blue" style={{ fontSize: "13px", padding: "6px 14px" }}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg) 100%)" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "16px" }}>Твои эмоции. Не твоё лицо.</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "36px", maxWidth: "420px", margin: "0 auto 36px" }}>
            Первые 100 клиентов получают бесплатную вводную сессию. Мест осталось — нет бесконечно.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn btn-primary btn-lg">Начать бесплатно</Link>
            <Link href="/sessions/book" className="btn btn-secondary btn-lg">Пробная сессия</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer style={{ padding: "32px 24px", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Apro<span style={{ color: "var(--accent)" }}>sop</span></span>
          <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>© 2024 Aprosop · Perfect connection. Zero data.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/login" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Войти</Link>
            <Link href="/register" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Регистрация</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
