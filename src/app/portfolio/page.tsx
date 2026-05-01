'use client';

import Link from 'next/link';

export default function PortfolioPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1000px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
        <div>
          [<Link href="/">{'<'}</Link>] 📁 WH4T!SLOV3 / 📁 PORTFOL1O
        </div>
        <div>
          [ <Link href="/">🏠</Link> ][<Link href="/">x</Link>]
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginTop: '40px', justifyContent: 'center' }}>
        {/* Имитация папок портфолио */}
        {[1, 2, 3].map((item) => (
          <div key={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <pre className="ascii-art" style={{ fontSize: '10px', fontWeight: 'bold' }}>
{`
 _________________
|  ___________  |
| |           | |
| | PROJECT_0${item}| |
| |___________| |
|_______________|
`}
            </pre>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>[ открыть ]</span>
          </div>
        ))}
      </div>
    </div>
  );
}
