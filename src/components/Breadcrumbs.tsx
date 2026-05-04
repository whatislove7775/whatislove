'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cart from '@/app/cart/Cart'; 

export default function Breadcrumbs({ path }: any) {
  const pathname = usePathname();
  const backLink = path.length > 1 && path[path.length - 2].href ? path[path.length - 2].href : '/';
  const shouldShowCart = pathname.startsWith('/products') || pathname.startsWith('/checkout');

  // Единый стиль для всех кнопок в навигации
  const navItemStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 800,
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%', 
      marginBottom: '40px',
      position: 'relative', 
      zIndex: 100           
    }}>
      
      {/* ЛЕВАЯ ЧАСТЬ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href={backLink} style={navItemStyle}>
          [{"<"}]
        </Link>
        <span style={{ ...navItemStyle, whiteSpace: 'nowrap' }}>
          {path.map((item: any, index: number) => (
            <span key={index} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {item.href ? (
                <Link href={item.href} style={navItemStyle}>
                  {item.icon && `${item.icon} `}{item.name}
                </Link>
              ) : (
                <span>{item.icon && `${item.icon} `}{item.name}</span>
              )}
              {index < path.length - 1 && <span style={{ margin: '0 5px' }}>/</span>}
            </span>
          ))}
        </span>
      </div>

      {/* ПРАВАЯ ЧАСТЬ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {/* ДОМИК */}
          <Link href="/" style={navItemStyle}>
            [ 🏠 ]
          </Link>

          {/* КОРЗИНА (свисает вниз) */}
          {shouldShowCart && (
            <div style={{ 
              position: 'absolute', 
              top: 'calc(100% + 20px)', 
              left: 0,                 
              zIndex: 1000
            }}>
              <Cart />
            </div>
          )}
        </div>

        {/* КРЕСТИК (теперь строго 14px) */}
        <Link href={backLink} style={navItemStyle}>
          [ × ]
        </Link>
      </div>
      
    </div>
  );
}
