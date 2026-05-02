'use client';
import Link from 'next/link';

interface Props {
  path: { name: string; href?: string; icon?: string }[];
}

export default function Breadcrumbs({ path }: Props) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      width: '100%', 
      fontWeight: 700, 
      textTransform: 'uppercase', 
      marginBottom: '40px',
      position: 'relative', // Вытаскиваем на передний план
      zIndex: 50          // Защита от перекрытия невидимыми блоками
    }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>[&lt;]</Link>
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>📁 WH4T!SLOV3</Link>
        <span>/</span>
        {path.map((item, index) => (
          <span key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {item.href ? (
              <Link href={item.href} style={{ textDecoration: 'none', color: '#000' }}>
                {item.icon} {item.name}
              </Link>
            ) : (
              <span>{item.icon} {item.name}</span>
            )}
            {index < path.length - 1 && <span>/</span>}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>[ 🏠 ]</Link>
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>[x]</Link>
      </div>
    </div>
  );
}
