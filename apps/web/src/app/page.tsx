export default function HomePage() {
  return (
    <>
      <style>{`
        .btn-primary {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          padding: 0.85rem 2.2rem;
          border: 1px solid var(--accent-chrome);
          color: var(--accent-chrome);
          background: transparent;
          text-decoration: none;
          text-transform: uppercase;
          transition: background var(--transition-base), color var(--transition-base);
        }
        .btn-primary:hover {
          background: var(--accent-chrome);
          color: var(--chrome-900);
        }
        .btn-secondary {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          letter-spacing: 0.12em;
          padding: 0.85rem 2.2rem;
          border: 1px solid var(--chrome-500);
          color: var(--chrome-400);
          background: transparent;
          text-decoration: none;
          text-transform: uppercase;
          transition: border-color var(--transition-base), color var(--transition-base);
        }
        .btn-secondary:hover {
          border-color: var(--chrome-300);
          color: var(--chrome-200);
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "var(--chrome-900)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 6vw, 4rem)",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "var(--accent-chrome)",
            textShadow: "0 0 40px var(--accent-chrome-glow)",
            marginBottom: "1.5rem",
          }}
        >
          ANON PSY
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.1rem",
            fontWeight: 300,
            color: "var(--chrome-300)",
            maxWidth: "480px",
            lineHeight: 1.7,
            marginBottom: "3rem",
          }}
        >
          Анонимное психологическое консультирование.
          <br />
          Верифицированные специалисты. Полная конфиденциальность.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <a href="/api/auth/register/" className="btn-primary">
            Начать
          </a>
          <a href="/api/" className="btn-secondary">
            API
          </a>
        </div>

        <p
          style={{
            position: "absolute",
            bottom: "2rem",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--chrome-600)",
            letterSpacing: "0.08em",
          }}
        >
          ZERO-KNOWLEDGE · END-TO-END · P2P VIDEO
        </p>
      </main>
    </>
  );
}
