import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      
      {/* Сюда вставь свой точный ASCII-арт wh4t!slov3 <3 */}
      <pre className="ascii-art" style={{ fontSize: '10px', lineHeight: '1.2', textAlign: 'center', letterSpacing: '1px' }}>
{`
 _       _  _    _  _  _____  _      _____  _    _  _____      ___   
| |     | || |  | || ||___  || |    |  _  || |  | ||  ___|    |_  |  
| |  _  | || |__| || |   / / | |    | | | || |  | || |__        | |  
| |/| |/ ||  __  || |  / /  | |    | | | || |/\| ||  __|       | |  
\\__/\\__/ |_|  |_||_| /_/   | |___ \\_/_/ \\_/\\_/ \\____/    \\___/   
`}
      </pre>

      {/* Навигация с эмодзи строго по центру */}
      <nav style={{ display: 'flex', gap: '8px', fontWeight: 'bold', fontSize: '15px', alignItems: 'center' }}>
        <Link href="/products" style={{ color: '#000', textDecoration: 'none' }}>📦 PRODUCT$</Link>
        <span>/</span>
        <Link href="/portfolio" style={{ color: '#000', textDecoration: 'none' }}>📁 PORTFOL1O</Link>
        <span>/</span>
        <Link href="/links" style={{ color: '#000', textDecoration: 'none' }}>🔗 LINK^S</Link>
      </nav>

    </div>
  );
}
