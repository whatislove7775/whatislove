'use client';
import { useCartStore } from '../store/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{
      position: 'absolute',
      top: '20px', 
      right: '20px',
      width: '120px', // ВЕРНУЛИ СТАНДАРТНЫЙ РАЗМЕР
      zIndex: 1000,
      fontWeight: 700
    }}>
      <div style={{ width: '100%', marginBottom: '15px' }}>
        <img src="/куаркод над корзиной.svg" alt="QR" style={{ width: '100%', height: 'auto' }} />
      </div>

      <div style={{ marginBottom: '10px', textTransform: 'lowercase' }}>
        корзина [{totalItemsCount}]
      </div>

      {items.length === 0 ? (
        <div style={{ fontWeight: 500, textTransform: 'lowercase' }}>пусто...</div>
      ) : (
        <>
          {items.map((item, i) => (
            <div key={`${item.id}-${item.size}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', fontWeight: 500, textTransform: 'lowercase', fontSize: '14px' }}>
              <span style={{ lineHeight: '1.2' }}>
                {item.name} <span style={{ color: 'red' }}>[{item.size}]</span><br/>
                x{item.quantity}
              </span>
              <span onClick={() => removeItem(item.id, item.size)} style={{ cursor: 'pointer' }}>[x]</span>
            </div>
          ))}
          <div style={{ marginTop: '20px', textTransform: 'lowercase' }}>
            итого:<br/>{totalPrice()}₽
          </div>
          <Link href="/checkout" style={{ display: 'block', marginTop: '10px', textTransform: 'lowercase', textDecoration: 'none', color: '#000' }}>[заказать] 📦</Link>
        </>
      )}
    </div>
  );
}
