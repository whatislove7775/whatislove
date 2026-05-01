'use client';

import Link from 'next/link';

export default function LinksPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
        <div>
          [<Link href="/">{'<'}</Link>] 📁 WH4T!SLOV3 / 🔗 LINK^S
        </div>
        <div>
          [ <Link href="/">🏠</Link> ][<Link href="/">x</Link>]
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '60px', fontWeight: 'bold', fontSize: '18px' }}>
        <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer">[ ТЕЛЕГРАМ КАНАЛ ]</a>
        <a href="https://t.me/babydonthurtmovich" target="_blank" rel="noopener noreferrer">[ СВЯЗЬ С АВТОРОМ ]</a>
        <Link href="/info">[ ИНФО / FAQ ]</Link>
      </div>
    </div>
  );
}
