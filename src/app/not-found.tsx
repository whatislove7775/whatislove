'use client';
import { useState } from 'react';
import DuckGame from '@/components/DuckGame';
import NiceTryKeys from '@/components/NiceTryKeys';

export default function NotFound() {
  const [started, setStarted] = useState(false);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Заголовок ошибки — исчезает, как только игрок начал игру */}
      {!started && (
        <div style={{ textAlign: 'center', textTransform: 'uppercase', paddingTop: '20px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <NiceTryKeys />
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
