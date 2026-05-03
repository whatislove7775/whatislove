'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cart from './Cart'; // Подтянули корзину сюда

interface Breadcrumb {
  name: string;
  href?: string;
  icon?: string;
}

export default function Breadcrumbs({ path }: { path: Breadcrumb[] }) {
  const router = useRouter();
  const pathname = usePathname();
  // Показываем корзину только там, где нужно
  const showCart = pathname.startsWith('/products') || pathname === '/info';

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%',
      fontWeight: 800,
      textTransform: 'uppercase',
      fontSize: '14px',
      marginBottom: '20px',
      position: 'relative', 
      zIndex: 50            
    }}>
      
      {/* Левая часть (Крошки) */}
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

      {/* Правая часть (Домой, Крестик и КОРЗИНА) */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>[ 🏠 ]</Link>
        <span onClick={() => router.back()} style={{ cursor: 'pointer' }}>[x]</span>
        
        {/* Корзина выровнена ровно по левому краю этого блока (по домику) */}
        {showCart && (
          <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '15px' }}>
            <Cart />
          </div>
        )}
      </div>
      
    </div>
  );
}
