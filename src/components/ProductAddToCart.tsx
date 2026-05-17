'use client';
import { useCartStore } from '@/store/cartStore';

export default function ProductAddToCart({ product }: { product: any }) {
  const addItem = useCartStore((state: any) => state.addItem);

  const stock = product.stock || {};
  const isAvailable = [16, 17, 18, 19].some((s) => (stock[s.toString()] || 0) > 0);

  const handleAdd = () => {
    if (!isAvailable) return;
    const firstAvailable = [16, 17, 18, 19].find((s) => (stock[s.toString()] || 0) > 0) ?? 17;
    addItem({ id: product.id, name: product.name, price: product.price, size: firstAvailable, quantity: 1 });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!isAvailable}
      style={{
        background: 'transparent',
        border: 'none',
        fontWeight: 800,
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit',
        padding: 0,
        fontSize: '14px',
        opacity: isAvailable ? 1 : 0.4,
      }}
    >
      {isAvailable ? "[ +в 🛒'у ]" : '[ нет в наличии ]'}
    </button>
  );
}
