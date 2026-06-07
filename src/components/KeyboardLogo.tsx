'use client';
import Keycap from './Keycap';
import useFloatingEmoji from './useFloatingEmoji';
import { playVoice } from './voiceClips';

const MAIN_AR  = 1627 / 222;
const HEART_AR = 311  / 216;

// Известные женские голоса разных платформ (Apple / Google / Microsoft)
const FEMALE_NAMES = [
  'Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria', 'Allison',
  'Susan', 'Zoe', 'Nicky', 'Alice', 'Serena', 'Kathy', 'Ava',
  'Google US English', 'Google UK English Female',
  'Zira', 'Hazel', 'Aria', 'Jenny', 'Eva', 'Female',
];
const MALE_HINT = /male|david|mark|daniel|fred|alex|rishi|oliver|george|james|guy|tom|arthur/i;

// Мягкие тёплые параметры для каждой клавиши — разный, но приятный женский тон
const SLOT_STYLE = [
  { pitch: 1.25, rate: 0.78 },  // wh4t — низковатый бархатный
  { pitch: 1.45, rate: 0.82 },  // is   — выше, игривый
  { pitch: 1.15, rate: 0.72 },  // love?— самый низкий, томный
];

// Премиальные/«натуральные» голоса звучат живее — поднимаем их в приоритет
const PREMIUM_HINT = /natural|neural|premium|enhanced|google|siri|samantha|ava|serena|zoe|aria|jenny/i;

function speakWord(word: string, slot: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const go = (voices: SpeechSynthesisVoice[]) => {
    const en = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    // Строго женские: по имени из списка ИЛИ содержит "female", и не мужские
    let female = en.filter(v =>
      !MALE_HINT.test(v.name) &&
      (FEMALE_NAMES.some(n => v.name.includes(n)) || /female/i.test(v.name))
    );
    if (!female.length) female = en.filter(v => !MALE_HINT.test(v.name));
    if (!female.length) female = en;

    // Премиальные голоса — вперёд, чтобы звучали красивее
    female.sort((a, b) => (PREMIUM_HINT.test(b.name) ? 1 : 0) - (PREMIUM_HINT.test(a.name) ? 1 : 0));

    const voice = female[slot % Math.max(female.length, 1)];
    const style = SLOT_STYLE[slot % SLOT_STYLE.length];
    const u = new SpeechSynthesisUtterance(word);
    if (voice) u.voice = voice;
    u.lang = 'en-US';
    u.pitch = style.pitch;
    u.rate = style.rate;
    u.volume = 1;
    synth.cancel();
    synth.speak(u);
  };
  const v = synth.getVoices();
  if (v.length) go(v);
  else synth.addEventListener('voiceschanged', () => go(synth.getVoices()), { once: true });
}

export default function KeyboardLogo() {
  const { items, spawn } = useFloatingEmoji();

  return (
    <>
      {/* ── Desktop: два клавиши в ряд ── */}
      <div className="kb-logo desktop-only" aria-label="wh4tislove">
        <Keycap id="main" tw={470} th={112} className="keycap-main"
                img={{ src: '/keys/wh4tislove_src.png', ar: MAIN_AR, h: 50 }} />
        <div style={{ position: 'relative' }}>
          {items.map(({ id, x }) => (
            <span key={id} className="floating-emoji" style={{ '--hx': `${x}px` } as React.CSSProperties}>❤️</span>
          ))}
          <Keycap id="heart" tw={128} th={112} className="keycap-heart"
                  img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 58 }}
                  onClick={spawn} />
        </div>
      </div>

      {/* ── Mobile: 2×2 сетка ── */}
      <div className="kb-logo-mobile mobile-only" aria-label="wh4tislove">
        {/* wh4t */}
        <div>
          <Keycap id="wh4t" tw={240} th={120}
                  img={{ text: 'wh4t', fontSize: 80 }}
                  onClick={() => playVoice('what', '/sounds/what.mp3', 'full')} />
        </div>

        {/* is */}
        <div>
          <Keycap id="is-key" tw={128} th={120}
                  img={{ text: 'is', fontSize: 80 }}
                  onClick={() => speakWord('is', 1)} />
        </div>

        {/* love? */}
        <div>
          <Keycap id="love-key" tw={240} th={120}
                  img={{ text: 'love?', fontSize: 80 }}
                  onClick={() => playVoice('love', '/sounds/love.mp3', 'first')} />
        </div>

        {/* <3 — наклон на самой клавише; обёртка ровная, чтобы сердечки летели
            строго вверх, перпендикулярно футеру */}
        <div className="heart-cell-m" style={{ position: 'relative', zIndex: 10 }}>
          {items.map(({ id, x }) => (
            <span key={id} className="floating-emoji"
                  style={{ '--hx': `${x}px`, zIndex: 50 } as React.CSSProperties}>❤️</span>
          ))}
          <Keycap id="heart-m" className="keycap-heart" tw={128} th={120}
                  img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 64 }}
                  onClick={spawn} />
        </div>
      </div>
    </>
  );
}
