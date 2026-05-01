'use client';
import Link from 'next/link';

interface Props {
  path: { name: string; href?: string; icon?: string }[];
}

export default function Breadcrumbs({ path }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 'bold', fontSize: '14px', marginBottom: '30px', textTransform: 'uppercase' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Link href="/">[{"<"}]</Link>
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
        <Link href="/">[🏠]</Link>
        <Link href="/">[x]</Link>
      </div>
    </div>
  );
}
