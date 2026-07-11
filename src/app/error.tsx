'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center', textTransform: 'uppercase' }}>
      <div style={{ fontWeight: 700, fontSize: '16px' }}>
        ⚠ ЧТО-ТО ПОШЛО НЕ ТАК ⚠<br />
        ПРОИЗОШЛА ОШИБКА
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '20px', textTransform: 'none' }}>
        <button
          onClick={reset}
          style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
        >
          [ попробовать снова ]
        </button>
        <Link href="/" style={{ fontWeight: 800, fontSize: '14px', textDecoration: 'underline', color: 'inherit' }}>
          [ на главную ]
        </Link>
      </div>
    </div>
  );
}
