'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function ProductAddToCart({ product }: { product: any }) {
  const addItem = useCartStore((state: any) => state.addItem);
  const items = useCartStore((state: any) => state.items);

  const stock: Record<string, number> = product.stock || {};
  const sizes = Object.keys(stock).sort((a, b) => Number(a) - Number(b));
  const isAvailable = true;
  const isInCart = items.some((i: any) => i.id === product.id);
  const isPreorder = !!product.preorder_mode;

  const btnStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    fontWeight: 800,
    fontFamily: 'inherit',
    padding: 0,
    fontSize: '14px',
    cursor: isAvailable ? 'pointer' : 'not-allowed',
    opacity: isAvailable ? 1 : 0.4,
  };

  const handleAdd = () => {
    const firstAvailable = sizes[0];
    if (!firstAvailable) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: Number(firstAvailable),
      quantity: 1,
      imageUrl: product.image_url || undefined,
    });
  };

  // В режиме предзаказа ведём на страницу товара, где есть форма предзаказа
  if (isPreorder) {
    return (
      <Link href={`/products/${product.slug}`} style={{ fontWeight: 800, fontSize: '14px', color: '#000' }}>
        [ предзаказать ]
      </Link>
    );
  }

  return (
    <>
      {/* Desktop: всегда кнопка добавить */}
      <button className="desktop-only" onClick={handleAdd} disabled={!isAvailable} style={btnStyle}>
        {isAvailable ? "[ +в 🛒'у ]" : '[ нет в наличии ]'}
      </button>

      {/* Mobile: после добавления — ссылка на заказ */}
      {!isAvailable ? (
        <span className="mobile-only" style={{ ...btnStyle, cursor: 'not-allowed' }}>[ нет в наличии ]</span>
      ) : isInCart ? (
        <Link href="/checkout" className="mobile-only" style={{ fontWeight: 800, fontSize: '14px', color: '#000' }}>
          [перейти к 🛒&apos;е]
        </Link>
      ) : (
        <button className="mobile-only" onClick={handleAdd} style={btnStyle}>
          [ +в 🛒&apos;у ]
        </button>
      )}
    </>
  );
}
