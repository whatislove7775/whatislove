"use client";

/**
 * Landing teaser for «Круги»: small anonymous support groups with a psychologist.
 *
 * The ring is quietly alive: seats float, the «speaking» glow passes from one participant to the next.
 * With a fine pointer (desktop) it also reacts: the centre leans towards the cursor and warms up as it
 * gets close, a hovered seat lifts, shows its name and raises a hand. Touch devices get only the calm
 * auto-animation (no listeners), and prefers-reduced-motion stills everything.
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Hand } from "lucide-react";
import { AvatarThumb } from "@/components/avatar/AvatarThumb";
import { toneClass } from "@/components/circles/bits";
import s from "@/components/landing/landing.module.css";
import c from "@/components/circles/circles.module.css";

const SEATS: { name: string; tone: string; hand?: boolean }[] = [
  { name: "Лиса", tone: "coral" },
  { name: "Сова", tone: "lilac" },
  { name: "Кит", tone: "cyan", hand: true },
  { name: "Ёж", tone: "sun" },
  { name: "Выдра", tone: "mint" },
  { name: "Панда", tone: "lilac" },
  { name: "Енот", tone: "cyan" },
];

/** Speaking order: not strictly around the circle, like a real conversation. */
const TALK = [0, 3, 5, 1, 4, 2, 6];

export function CirclesTeaser() {
  const scene = useRef<HTMLDivElement>(null);
  const [talk, setTalk] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [interactive, setInteractive] = useState(false);

  // Pass the «speaking» glow around; paused while someone is hovered, off with reduced motion.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) return;
    const id = window.setInterval(() => setTalk((t) => (t + 1) % TALK.length), 2600);
    return () => window.clearInterval(id);
  }, []);

  // Pointer parallax: only for a fine pointer that can hover.
  useEffect(() => {
    const el = scene.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!el || !fine.matches || still.matches) return;
    setInteractive(true);
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        const dist = Math.hypot(dx, dy);
        const k = Math.min(1, dist);
        el.style.setProperty("--px", ((dx / Math.max(1, dist)) * k).toFixed(3));
        el.style.setProperty("--py", ((dy / Math.max(1, dist)) * k).toFixed(3));
        el.style.setProperty("--near", Math.max(0, 1 - dist / 1.6).toFixed(3));
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--px", "0");
      el.style.setProperty("--py", "0");
      el.style.setProperty("--near", "0");
    };
    // Listen on the whole section so the centre starts leaning before the cursor reaches the ring.
    const zone = el.closest("section") ?? el;
    zone.addEventListener("pointermove", onMove as EventListener);
    zone.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", onMove as EventListener);
      zone.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const speaking = hover ?? TALK[talk];

  return (
    <section id="circles" className={`${s.wrap} ${s.section}`} aria-labelledby="circles-title">
      <div className={s.circles}>
        <div className={s.circlesText}>
          <p className={s.kicker}>Круги</p>
          <h2 id="circles-title" className={s.sectionTitle}>
            Когда важно услышать «у&nbsp;меня так&nbsp;же»
          </h2>
          <p className={s.sectionSub}>Группы на&nbsp;5–8&nbsp;человек с&nbsp;психологом, раз в&nbsp;неделю. Тоже с&nbsp;аватаром. Можно просто слушать.</p>
          <Link href="/app/circles" className={s.more}>
            Посмотреть круги
            <ArrowRight size={16} strokeWidth={2} aria-hidden />
          </Link>
        </div>
        <div
          ref={scene}
          className={`${c.ringScene} ${s.ring}`}
          data-interactive={interactive || undefined}
          aria-hidden
        >
          <span className={s.ringOrbit} />
          <div className={c.ringCenter}>Психолог</div>
          {SEATS.map((seat, i) => {
            const a = (i / SEATS.length) * Math.PI * 2 - Math.PI / 2;
            const hand = seat.hand || hover === i;
            return (
              <div
                key={seat.name}
                className={`${c.ringSeat} ${toneClass(seat.tone)} ${s.seat} ${speaking === i ? s.seatTalk : ""}`}
                style={{ left: `${50 + 38 * Math.cos(a)}%`, top: `${50 + 38 * Math.sin(a)}%`, ["--i" as string]: i }}
                data-above={Math.sin(a) < -0.2 || undefined}
                onPointerEnter={interactive ? () => setHover(i) : undefined}
                onPointerLeave={interactive ? () => setHover((h) => (h === i ? null : h)) : undefined}
              >
                <span className={s.seatFace}>
                  <AvatarThumb config={null} seed={`landing-circle-${seat.name}`} size={64} />
                </span>
                <span className={`${c.ringWave} ${s.ringHand} ${hand ? s.handUp : ""}`}>
                  <Hand size={12} />
                </span>
                <span className={s.seatName}>Участник-{seat.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
