'use client';
import Keycap from './Keycap';
import useFloatingEmoji from './useFloatingEmoji';

const MAIN_AR  = 1627 / 222;
const HEART_AR = 311  / 216;

// TTS — разные женские голоса для каждой клавиши
const FEMALE_NAMES = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona', 'Victoria', 'Allison', 'Susan', 'Zoe', 'Nicky', 'Alice'];

function speakWord(word: string, slot: number) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const go = (voices: SpeechSynthesisVoice[]) => {
    const female = voices.filter(v => v.lang.startsWith('en') && FEMALE_NAMES.some(n => v.name.includes(n)));
    const pool   = female.length ? female : voices.filter(v => v.lang.startsWith('en'));
    const voice  = pool[slot % Math.max(pool.length, 1)];
    const u = new SpeechSynthesisUtterance(word);
    if (voice) u.voice = voice;
    u.lang = 'en-US'; u.pitch = 1.2; u.rate = 0.85;
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
          <Keycap id="wh4t" tw={188} th={112}
                  img={{ text: 'wh4t', fontSize: 68 }}
                  onClick={() => speakWord('what', 0)} />
        </div>

        {/* is */}
        <div>
          <Keycap id="is-key" tw={100} th={112}
                  img={{ text: 'is', fontSize: 72 }}
                  onClick={() => speakWord('is', 1)} />
        </div>

        {/* love? */}
        <div>
          <Keycap id="love-key" tw={188} th={112}
                  img={{ text: 'love?', fontSize: 54 }}
                  onClick={() => speakWord('love', 2)} />
        </div>

        {/* <3 — с летящими сердечками (z-index > верхний ряд) */}
        <div style={{ position: 'relative', transform: 'rotate(8deg)', zIndex: 10 }}>
          {items.map(({ id, x }) => (
            <span key={id} className="floating-emoji"
                  style={{ '--hx': `${x}px`, zIndex: 50 } as React.CSSProperties}>❤️</span>
          ))}
          <Keycap id="heart-m" tw={100} th={112}
                  img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 58 }}
                  onClick={spawn} />
        </div>
      </div>
    </>
  );
}
