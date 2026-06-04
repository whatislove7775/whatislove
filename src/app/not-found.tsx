'use client';
import { useState } from 'react';
import DuckGame from '@/components/DuckGame';

export default function NotFound() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Заголовок ошибки — исчезает, как только игрок начал игру */}
      {!started && (
        <div style={{ textAlign: 'center', textTransform: 'uppercase', paddingTop: '20px' }}>
          <div style={{ marginBottom: '24px' }}>
            <img src="/404.svg" alt="nice try" className="desktop-only" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
            <img src="/nicetry.svg" alt="nice try" className="mobile-only" style={{ width: '100%', maxWidth: '320px', height: 'auto' }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>
            ⚠ ОШИБКА 404 ⚠<br />
            СТРАНИЦА НЕ НАЙДЕНА
          </div>
          <div style={{ marginTop: '14px', fontWeight: 700, fontSize: '12px', color: '#888', textTransform: 'none' }}>
            раз уж вы здесь — поиграйте в утку 🦆 (нажмите пробел)
          </div>
        </div>
      )}

      {/* Игра — полностью идентична той, что на /lucky */}
      <DuckGame onStart={() => setStarted(true)} />
    </div>
  );
}
