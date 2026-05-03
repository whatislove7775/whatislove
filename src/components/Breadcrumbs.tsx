'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Breadcrumb {
  name: string;
  href?: string;
  icon?: string;
}

export default function Breadcrumbs({ path }: { path: Breadcrumb[] }) {
  const router = useRouter();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', // ЖЕСТКОЕ ВЫРАВНИВАНИЕ ПО ВЕРТИКАЛИ
      width: '100%',
      fontWeight: 800,
      textTransform: 'uppercase',
      fontSize: '14px',
      marginBottom: '20px'
    }}>
      
      {/* Левая часть: Назад и Путь */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span onClick={() => router.back()} style={{ cursor: 'pointer', marginRight: '10px' }}>
          [&lt;]
        </span>
        
        {path.map((item, index) => (
          <span key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {item.icon && <span>{item.icon}</span>}
            {item.href ? (
              <Link href={item.href} style={{ textDecoration: 'none', color: '#000' }}>
                {item.name}
              </Link>
            ) : (
              <span>{item.name}</span>
            )}
            {index < path.length - 1 && <span style={{ margin: '0 4px' }}>/</span>}
          </span>
        ))}
      </div>

      {/* Правая часть: Домой и Закрыть */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>[ 🏠 ]</Link>
        <span onClick={() => router.back()} style={{ cursor: 'pointer' }}>[x]</span>
      </div>
      
    </div>
  );
}
