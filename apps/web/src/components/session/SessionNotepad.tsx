"use client";

import { useEffect, useRef, useState } from "react";

interface Props { roomId: string; }

const TTL_MS = 24 * 60 * 60 * 1000;

export function SessionNotepad({ roomId }: Props) {
  const [text, setText]         = useState("");
  const [visible, setVisible]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const saveTimer               = useRef<ReturnType<typeof setTimeout>>();
  const key                     = `aprosop_note_${roomId}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const { value, ts } = JSON.parse(raw);
      if (Date.now() - ts > TTL_MS) { localStorage.removeItem(key); return; }
      setText(value);
    } catch { localStorage.removeItem(key); }
  }, [key]);

  const handleChange = (v: string) => {
    setText(v);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify({ value: v, ts: Date.now() }));
      setSaved(true);
    }, 800);
  };

  const clear = () => {
    setText("");
    localStorage.removeItem(key);
    setSaved(false);
  };

  if (!visible) return (
    <button
      onClick={() => setVisible(true)}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(23,33,43,0.9)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", fontSize: "18px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      title="Блокнот сессии"
    >📝</button>
  );

  return (
    <div style={{
      position: "fixed", bottom: "80px", right: "16px", zIndex: 50,
      width: "300px", background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-lg)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderBottom: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: "13px", fontWeight: 600 }}>📝 Заметки</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {saved && <span style={{ fontSize: "11px", color: "var(--success)" }}>сохранено</span>}
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>удалятся через 24ч</span>
          <button onClick={clear} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "11px" }}>очистить</button>
          <button onClick={() => setVisible(false)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "16px" }}>×</button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        placeholder="Пишите здесь во время сессии..."
        style={{
          width: "100%", minHeight: "180px", resize: "vertical",
          background: "transparent", border: "none", padding: "14px 16px",
          color: "var(--text)", fontSize: "13px", lineHeight: 1.6,
          outline: "none", fontFamily: "var(--font)",
        }}
      />
    </div>
  );
}
