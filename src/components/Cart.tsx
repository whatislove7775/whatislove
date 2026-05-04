'use client';
import { useCartStore } from '../store/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();
  const totalItemsCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  // Общий стиль для всего текста в корзине
  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    textTransform: 'lowercase',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      width: '120px', 
      zIndex: 1000,
      fontWeight: 800, // Жирный для структуры
      ...textStyle
    }}>
      <div style={{ width: '100%', marginBottom: '15px' }}>
        <img src="/qr-code.svg" alt="QR" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </div>

      <div style={{ marginBottom: '10px' }}>
        корзина [{totalItemsCount}]
      </div>

      {items.length === 0 ? (
        <div style={{ fontWeight: 500 }}>пусто...</div>
      ) : (
        <>
          {items.map((item, i) => (
            <div key={`${item.id}-${item.size}-${i}`} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '8px', 
              fontWeight: 500, 
              lineHeight: 1.2 
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{item.name}</span>
                  <span style={{ color: 'red' }}>[{item.size}]</span>
                </div>
                <span>x{item.quantity}</span>
              </div>
              <span 
                onClick={() => removeItem(item.id, item.size)} 
                style={{ cursor: 'pointer', fontWeight: 800 }}
              >
                [x]
              </span>
            </div>
          ))}
          <div style={{ marginTop: '20px' }}>
            итого:<br/>{totalPrice()}₽
          </div>
          <Link href="/checkout" style={{ display: 'block', marginTop: '10px', textDecoration: 'none', color: '#000', fontWeight: 800 }}>
            [заказать] 📦
          </Link>
        </>
      )}
    </div>
  );
}
