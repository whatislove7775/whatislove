'use client';
import Link from 'next/link';

export default function Breadcrumbs({ path }: { path: any[] }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      width: '100%', 
      fontWeight: 700, 
      fontSize: '13px', 
      marginBottom: '50px',
      letterSpacing: '0.5px'
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/">[ {"<"} ]</Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          📁 WH4T!SLOV3
        </Link>
        <span>/</span>
        {path.map((item, i) => (
          <span key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {item.href ? (
              <Link href={item.href}>{item.icon} {item.name}</Link>
            ) : (
              <span>{item.icon} {item.name}</span>
            )}
            {i < path.length - 1 && <span>/</span>}
          </span>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link href="/">[ 🏠 ]</Link>
        <Link href="/">[ X ]</Link>
      </div>
    </div>
  );
}
