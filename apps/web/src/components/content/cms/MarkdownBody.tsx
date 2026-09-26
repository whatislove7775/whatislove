"use client";

import { useRef, useState, type ReactNode } from "react";
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Quote } from "lucide-react";
import { Card, Segmented } from "@/ui";
import { Markdown } from "../Markdown";
import s from "./cms.module.css";

type Kind = "h2" | "b" | "i" | "ul" | "ol" | "quote" | "link";

/** Markdown body editor: formatting toolbar, text / side-by-side / preview. Shared by the CMS and /pro/articles. */
export function MarkdownBody({
  value,
  onChange,
  error,
  footer,
  label = "Текст статьи в\u00a0Markdown",
  placeholder = "Текст статьи.\n\n## Подзаголовок\n\n- пункт списка\n\n**жирный**, *курсив*, [ссылка](https://…)",
}: {
  value: string;
  onChange: (v: string) => void;
  error?: ReactNode;
  footer?: ReactNode;
  label?: string;
  placeholder?: string;
}) {
  const [mode, setMode] = useState<"split" | "write" | "preview">("split");
  const ref = useRef<HTMLTextAreaElement>(null);

  /** Wrap the selection (or insert at the cursor) with Markdown syntax. */
  const format = (kind: Kind) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value: v } = el;
    const sel = v.slice(a, b);
    const lineStart = v.lastIndexOf("\n", a - 1) + 1;
    let next = v;
    let cursor = b;
    const prefixLines = (p: (i: number) => string) => {
      const block = v.slice(lineStart, b) || "";
      const lines = (block || "Текст").split("\n").map((l, i) => p(i) + l.replace(/^(#{1,3}\s|[-*]\s|\d+\.\s|>\s?)/, ""));
      next = v.slice(0, lineStart) + lines.join("\n") + v.slice(b);
      cursor = lineStart + lines.join("\n").length;
    };
    const wrap = (l: string, r: string, placeholderText: string) => {
      const inner = sel || placeholderText;
      next = v.slice(0, a) + l + inner + r + v.slice(b);
      cursor = a + l.length + inner.length + r.length;
    };
    if (kind === "h2") prefixLines(() => "## ");
    if (kind === "ul") prefixLines(() => "- ");
    if (kind === "ol") prefixLines((i) => `${i + 1}. `);
    if (kind === "quote") prefixLines(() => "> ");
    if (kind === "b") wrap("**", "**", "важное");
    if (kind === "i") wrap("*", "*", "акцент");
    if (kind === "link") wrap("[", "](https://)", sel || "текст ссылки");
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <Card as="section" className={s.bodyCard}>
      <div className={s.toolbar}>
        <div className={s.tools} role="toolbar" aria-label="Форматирование">
          <ToolBtn label="Подзаголовок" onClick={() => format("h2")} icon={<Heading2 size={18} />} />
          <ToolBtn label="Жирный" onClick={() => format("b")} icon={<Bold size={18} />} />
          <ToolBtn label="Курсив" onClick={() => format("i")} icon={<Italic size={18} />} />
          <ToolBtn label="Список" onClick={() => format("ul")} icon={<List size={18} />} />
          <ToolBtn label="Нумерованный список" onClick={() => format("ol")} icon={<ListOrdered size={18} />} />
          <ToolBtn label="Врезка" onClick={() => format("quote")} icon={<Quote size={18} />} />
          <ToolBtn label="Ссылка" onClick={() => format("link")} icon={<Link2 size={18} />} />
        </div>
        <Segmented
          value={mode}
          onChange={setMode}
          ariaLabel="Режим редактора"
          options={[
            { value: "write", label: "Текст" },
            { value: "split", label: "Рядом" },
            { value: "preview", label: "Просмотр" },
          ]}
        />
      </div>
      <div className={s.bodyPanes} data-mode={mode}>
        {mode !== "preview" && (
          <div className={s.pane}>
            <textarea
              ref={ref}
              className={s.bodyInput}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-label={label}
              placeholder={placeholder}
              spellCheck
            />
            {error && <div className={s.error}>{error}</div>}
          </div>
        )}
        {mode !== "write" && (
          <div className={`${s.pane} ${s.preview}`} aria-label="Предпросмотр">
            {value.trim() ? <Markdown source={value} /> : <p className={s.muted}>Здесь появится предпросмотр.</p>}
          </div>
        )}
      </div>
      {footer && <div className={s.bodyFoot}>{footer}</div>}
    </Card>
  );
}

export function ToolBtn({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button type="button" className={s.tool} aria-label={label} title={label} onClick={onClick}>
      {icon}
    </button>
  );
}

export function estimateMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 160));
}
