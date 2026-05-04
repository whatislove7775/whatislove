'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cart from '@/components/Cart'; 

export default function Breadcrumbs({ path }: any) {
  const pathname = usePathname();
  const backLink = path.length > 1 && path[path.length - 2].href ? path[path.length - 2].href : '/';

  // УСЛОВИЕ ПОКАЗА: только на страницах каталога/товаров (/products...) или чекаута (/checkout)
  const shouldShowCart = pathname.startsWith('/products') || pathname.startsWith('/checkout');

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%', 
      fontWeight: 800, 
      fontSize: '14px', 
      marginBottom: '40px',
      position: 'relative', 
      zIndex: 100           
    }}>
      
      {/* ЛЕВАЯ ЧАСТЬ: Назад и Путь */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}>
          [{"<"}]
        </Link>
        <span style={{ whiteSpace: 'nowrap' }}>
          {path.map((item: any, index: number) => (
            <span key={index}>
              {item.href ? (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {item.icon && `${item.icon} `}{item.name}
                </Link>
              ) : (
                <span>{item.icon && `${item.icon} `}{item.name}</span>
              )}
              {index < path.length - 1 && ' / '}
            </span>
          ))}
        </span>
      </div>

      {/* ПРАВАЯ ЧАСТЬ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
        
        <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap', alignItems: 'center' }}>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              [ 🏠 ]
            </Link>

            {/* КОРЗИНА ПОЯВИТСЯ ТОЛЬКО ТАМ, ГДЕ ТЫ РАЗРЕШИЛ */}
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

          <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>
            [ × ]
          </Link>
        </div>
      </div>
      
    </div>
  );
}
