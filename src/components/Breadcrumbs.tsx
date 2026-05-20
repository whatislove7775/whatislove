'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Cart from '@/components/Cart';
import { useCartStore } from '@/store/cartStore';

export default function Breadcrumbs({ path }: any) {
  const pathname = usePathname();
  const backLink = path.length > 1 && path[path.length - 2].href ? path[path.length - 2].href : '/';
  const shouldShowCart = pathname.startsWith('/products') || pathname.startsWith('/checkout');
  const cartCount = useCartStore((state: any) =>
    state.items.reduce((acc: number, i: any) => acc + i.quantity, 0)
  );

  const navItemStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 800,
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: '40px',
      position: 'relative',
      zIndex: 100,
    }}>
      {/* ЛЕВАЯ ЧАСТЬ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href={backLink} style={navItemStyle}>[{"<"}]</Link>

        {/* Полный путь: только десктоп */}
        <span className="breadcrumb-path desktop-only" style={{ ...navItemStyle, whiteSpace: 'nowrap' }}>
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

        {/* Только текущая страница: мобильный */}
        <span className="mobile-only" style={{ ...navItemStyle, whiteSpace: 'nowrap' }}>
          {path[path.length - 1].icon && `${path[path.length - 1].icon} `}
          {path[path.length - 1].name}
        </span>
      </div>

      {/* ПРАВАЯ ЧАСТЬ */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Домик — только на десктопе */}
          <Link href="/" className="desktop-only" style={navItemStyle}>[ 🏠 ]</Link>

          {/* Иконка корзины — только на мобиле */}
          {shouldShowCart && (
            <Link href="/checkout" className="mobile-only" style={{ ...navItemStyle, whiteSpace: 'nowrap' }}>
              [🛒{cartCount > 0 ? ` ${cartCount}` : ''}]
            </Link>
          )}
        </div>

        <Link href={backLink} style={navItemStyle}>[ × ]</Link>

        {/* Корзина-сайдбар: left:0 выравнивает левый край с левым краем [🏠] */}
        {shouldShowCart && (
          <div className="desktop-only" style={{
            position: 'absolute',
            top: 'calc(100% + 20px)',
            left: 0,
            zIndex: 1000,
          }}>
            <Cart />
          </div>
        )}
      </div>
    </div>
  );
}
