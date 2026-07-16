'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../store/cartStore';
import DvdScreensaver from './DvdScreensaver';
import CursorManager from './CursorManager';
import DuckRain from './DuckRain';
import { unlockSilentMode } from './voiceClips';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  const [duckRain, setDuckRain] = useState(false);

  // ── SOUND ENGINE ────────────────────────────────────────────
  const acRef        = useRef<AudioContext | null>(null);
  const clickBuf     = useRef<AudioBuffer | null>(null);
  const popupBuf     = useRef<AudioBuffer | null>(null);
  const clickBytes   = useRef<ArrayBuffer | null>(null);
  const popupBytes   = useRef<ArrayBuffer | null>(null);
  const pendingPopup = useRef(false); // play popup sound on next user gesture

  // Prefetch encoded bytes immediately (no AudioContext needed yet)
  useEffect(() => {
    fetch('/sounds/click.mp3').then(r => r.arrayBuffer()).then(ab => { clickBytes.current = ab; }).catch(() => {});
    fetch('/sounds/popup.mp3').then(r => r.arrayBuffer()).then(ab => { popupBytes.current = ab; }).catch(() => {});
  }, []);

  function getAC(): AudioContext {
    if (!acRef.current) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext);
      acRef.current = new AC();
    }
    return acRef.current;
  }

  async function decodeIfNeeded(ac: AudioContext) {
    if (!clickBuf.current && clickBytes.current) {
      try { clickBuf.current = await ac.decodeAudioData(clickBytes.current.slice(0)); } catch {}
    }
    if (!popupBuf.current && popupBytes.current) {
      try { popupBuf.current = await ac.decodeAudioData(popupBytes.current.slice(0)); } catch {}
    }
  }

  function playBuf(ac: AudioContext, buf: AudioBuffer, vol = 1) {
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain();
    g.gain.value = vol;
    src.connect(g);
    g.connect(ac.destination);
    src.start();
  }

  // Global click/tap → play click sound + flush any pending popup sound
  useEffect(() => {
    const isTouch = typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window);
    // Интерактивные элементы — клавиши, кнопки, ссылки и т.п.
    const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label, summary, .keycap, [data-click-sound]';
    const onGesture = async (e: Event) => {
      try {
        unlockSilentMode(); // iOS: разрешаем Web Audio звучать в бесшумном режиме
        const ac = getAC();
        if (ac.state === 'suspended') await ac.resume();
        await decodeIfNeeded(ac);

        // На сенсорных устройствах основное событие — touchstart (исключаем
        // дубль от синтетического mousedown); на десктопе — mousedown.
        const isPrimary = isTouch ? e.type === 'touchstart' : e.type === 'mousedown';
        let shouldClick = false;
        if (isPrimary) {
          if (!isTouch) {
            // Десктоп: звук на любой клик (как было)
            shouldClick = true;
          } else {
            // Мобайл: звук только при нажатии на клавишу/кнопку/ссылку
            const t = e.target as Element | null;
            shouldClick = !!(t && t.closest(INTERACTIVE));
          }
        }
        if (shouldClick && clickBuf.current) playBuf(ac, clickBuf.current, 0.85);

        if (pendingPopup.current && popupBuf.current) {
          pendingPopup.current = false;
          setTimeout(() => { if (popupBuf.current) playBuf(ac, popupBuf.current); }, 0);
        }
      } catch {}
    };
    document.addEventListener('mousedown', onGesture);
    document.addEventListener('touchstart', onGesture, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onGesture);
      document.removeEventListener('touchstart', onGesture);
    };
  }, []);

  // Cookie popup appears → play popup sound (or defer to next click if AC not yet active)
  useEffect(() => {
    if (!showCookiePopup) return;
    try {
      const ac = acRef.current;
      if (ac && ac.state === 'running' && popupBuf.current) {
        playBuf(ac, popupBuf.current);
      } else {
        pendingPopup.current = true;
      }
    } catch {}
  }, [showCookiePopup]);
  // ────────────────────────────────────────────────────────────

  // ── CONSOLE EASTER EGG ──────────────────────────────────────
  useEffect(() => {
    try {
      const duck = [
        '%c',
        '      __',
        '   <(o )___',
        '    ( ._> /   WH4T!SLOV3',
        '     `---\'',
        '',
        'привет, любопытный 🦆',
        'нашёл консоль? попробуй konami-код на сайте: ↑ ↑ ↓ ↓ ← → ← → B A',
        'мы делаем штуки с любовью → t.me/whatislove_r',
      ].join('\n');
      console.log(duck, 'font-family:monospace;font-size:12px;color:#e8841a;font-weight:bold;');
    } catch {}
  }, []);

  // ── KONAMI CODE → DUCK RAIN ─────────────────────────────────
  useEffect(() => {
    const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      if (!e.key) return; // некоторые расширения/синтетические события шлют keydown без key
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === seq[idx]) {
        idx++;
        if (idx === seq.length) { idx = 0; setDuckRain(true); }
      } else {
        // allow restart if the wrong key is itself the first key of the sequence
        idx = key === seq[0] ? 1 : 0;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  
  const syncCart = useCartStore((state: any) => state.syncWithStorage);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('page-loading');
    } else {
      document.body.classList.remove('page-loading');
    }
  }, [isLoading]);

  // Эффект проверки согласия
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    
    if (consent !== 'accepted') {
      const popupTimer = setTimeout(() => {
        setShowCookiePopup(true);
      }, 3000);
      return () => clearTimeout(popupTimer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    if (syncCart) syncCart(); 
    setShowCookiePopup(false);
  };

  const handleDeclineCookies = () => {
    setShowCookiePopup(false);
  };

  if (pathname?.startsWith('/admin')) {
    return (
      <>
        <CursorManager />
        <DuckRain active={duckRain} onDone={() => setDuckRain(false)} />
        {children}
      </>
    );
  }

  return (
    <>
      <CursorManager />
      <DvdScreensaver />
      <DuckRain active={duckRain} onDone={() => setDuckRain(false)} />
      {/* ЗАГРУЗКА */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff',
        zIndex: 99999,
        display: isLoading ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontWeight: 800, fontSize: '20px', textTransform: 'lowercase', letterSpacing: '2px' }}>
          загрузка...
        </div>
      </div>

      {/* ПЛАШКА COOKIES */}
      {showCookiePopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          border: '1px solid #d9d9d9',
          width: '90%',
          maxWidth: '400px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'inherit',
          color: '#000',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: '1px solid #d9d9d9',
            fontWeight: 800,
            fontSize: '13px',
          }}>
            <div>▲ ВНИМАНИЕ!</div>
            <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
              <span onClick={handleDeclineCookies}>[ _ ]</span>
              <span onClick={handleDeclineCookies}>[ &times; ]</span>
            </div>
          </div>

          <div style={{
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '25px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.4, textTransform: 'uppercase' }}>
              НА САЙТЕ ИСПОЛЬЗУЮТСЯ COOKIES<br />
              И АНАЛИТИКА. <Link href="/privacy" className="link-underline" style={{ color: '#000' }}>ПОДРОБНЕЕ</Link>
            </div>
            
            <button
              onClick={handleAcceptCookies}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #000',
                padding: '8px 24px',
                fontWeight: 800,
                fontSize: '14px',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: '#000'
              }}
            >
              ПРИНЯТЬ
            </button>
          </div>
        </div>
      )}

      {/* КОНТЕНТ (Header, Main, Footer) */}
      <div id="site-content" style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        margin: 0,
        padding: 0,
      }}>
        <header style={{ textAlign: 'center', paddingTop: 'max(20px, env(safe-area-inset-top, 0px))', paddingBottom: '20px', fontWeight: 500, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block', position: 'relative' }}>
            <span style={{
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              textDecorationColor: '#ff3b30',
              textDecorationThickness: '2px',
              textUnderlineOffset: '3px',
            }}>wh4tislove</span>
            <span style={{ position: 'absolute', left: '100%', top: '1px', marginLeft: '3px' }}>©</span>
          </Link>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>
          {children}
        </main>

        {/* УСЛОВИЕ ДЛЯ ФУТЕРА: Если главная страница - центрированный, иначе - сетка */}
        {pathname === '/' ? (
          <footer className="home-footer">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              <a
                href="https://telegram.me/whatislove_r"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#000',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'none',
                  textTransform: 'lowercase'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                t.me/whatislove_r
              </a>
              <a
                href="https://telegram.me/roshaguchinsky"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#000',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  textDecoration: 'none',
                  textTransform: 'lowercase'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                t.me/roshaguchinsky
              </a>
            </div>
            <div className="home-disclaimer">
              ДАННАЯ ДИЗАЙН-СТУДИЯ НИЧЕГО НЕ&nbsp;НАВЯЗЫВАЕТ И&nbsp;НЕ&nbsp;ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРОВ И&nbsp;НЕ&nbsp;ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ&nbsp;УЛУЧШЕНИЯ СЕРВИСА &lt;333*
            </div>
          </footer>
        ) : (
          <footer style={{ flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
            <div className="footer-grid">
              <div style={{ fontWeight: 800, paddingBottom: '15px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <a href="https://telegram.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#000', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', textTransform: 'lowercase' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                  t.me/whatislove_r
                </a>
                <a href="https://telegram.me/roshaguchinsky" target="_blank" rel="noopener noreferrer" style={{ color: '#000', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', textTransform: 'lowercase' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                  t.me/roshaguchinsky
                </a>
              </div>
              <div></div>
              <div className="footer-grid-divider"></div>
              <div className="footer-links">
                <Link href="/oferta" style={{ color: '#000', textDecoration: 'none' }}>оферта /</Link>
                <Link href="/privacy" style={{ color: '#000', textDecoration: 'none' }}>политика конфиденциальности /</Link>
                <Link href="/info" style={{ color: '#000', textDecoration: 'none' }}>инфо</Link>
              </div>
              <div className="footer-disclaimer">
                ДАННАЯ ДИЗАЙН-СТУДИЯ НИЧЕГО НЕ&nbsp;НАВЯЗЫВАЕТ И&nbsp;НЕ&nbsp;ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРОВ И&nbsp;НЕ&nbsp;ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ&nbsp;УЛУЧШЕНИЯ СЕРВИСА &lt;333* ИНН&nbsp;231222682431
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* Info button — desktop only, all pages except about itself */}
      {pathname !== '/about' && (
        <Link href="/about" className="info-btn" aria-label="О студии" />
      )}
    </>
  );
}
