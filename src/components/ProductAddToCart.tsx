'use client';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function ProductAddToCart({ product }: { product: any }) {
  const addItem = useCartStore((state: any) => state.addItem);
  const items = useCartStore((state: any) => state.items);

  const stock = product.stock || {};
  const isAvailable = [16, 17, 18, 19].some((s) => (stock[s.toString()] || 0) > 0);
  const isInCart = items.some((i: any) => i.id === product.id);

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
    if (!isAvailable) return;
    const firstAvailable = [16, 17, 18, 19].find((s) => (stock[s.toString()] || 0) > 0) ?? 17;
    addItem({ id: product.id, name: product.name, price: product.price, size: firstAvailable, quantity: 1, imageUrl: product.image_url || undefined });
  };

  const unavailableBtn = (
    <button style={{ ...btnStyle, cursor: 'not-allowed', opacity: 0.4 }} disabled>
      [ нет в наличии ]
    </button>
  );

  return (
    <>
      {/* Desktop: всегда кнопка добавить */}
      <button className="desktop-only" onClick={handleAdd} disabled={!isAvailable} style={btnStyle}>
        {isAvailable ? "[ +в 🛒'у ]" : '[ нет в наличии ]'}
      </button>

      {/* Mobile: после добавления — ссылка на заказ */}
      {!isAvailable ? (
        <span className="mobile-only">{unavailableBtn}</span>
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
