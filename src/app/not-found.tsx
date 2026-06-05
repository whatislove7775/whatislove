'use client';
import { useState, useEffect } from 'react';
import DuckGame from '@/components/DuckGame';
import NiceTryKeys from '@/components/NiceTryKeys';

export default function NotFound() {
  const [started, setStarted] = useState(false);
  const [gameVisible, setGameVisible] = useState(false);

  useEffect(() => {
    if (gameVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setGameVisible(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameVisible]);

  const showGame = () => setGameVisible(true);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: gameVisible ? 'flex-start' : 'center', alignItems: 'center' }}>
      {!started && (
        <div style={{ textAlign: 'center', textTransform: 'uppercase' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <NiceTryKeys />
          </div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>
            ⚠ ОШИБКА 404 ⚠<br />
            СТРАНИЦА НЕ НАЙДЕНА
          </div>
          <div
            onClick={showGame}
            style={{ marginTop: '14px', fontWeight: 700, fontSize: '12px', color: '#888', textTransform: 'none', cursor: 'pointer' }}
          >
            раз уж вы здесь — поиграйте в утку 🦆 (нажмите пробел)
          </div>
        </div>
      )}

      {gameVisible && (
        <div style={{ width: '100%' }}>
          <DuckGame onStart={() => setStarted(true)} />
        </div>
      )}
    </div>
  );
}
