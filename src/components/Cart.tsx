'use client'; // Обязательно для компонентов с интерактивностью в Next.js 13+

import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '300px',
      backgroundColor: '#fff',
      border: '1px solid #000',
      padding: '20px',
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold' }}>
        <span>корзина [{items.reduce((acc, item) => acc + item.quantity, 0)}]</span>
        <span style={{ cursor: 'pointer' }}>[x]</span>
      </div>

      {items.length === 0 ? (
        <div>пусто...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                {item.name} {item.size && `[${item.size}]`} x{item.quantity}
                <div style={{ fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => removeItem(item.id, item.size)}>
                  убрать
                </div>
              </div>
              <div>{item.price * item.quantity}₽</div>
            </div>
          ))}
          
          <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px' }}>
            <div>итого: {totalPrice()}₽</div>
            <button style={{
              width: '100%',
              marginTop: '10px',
              padding: '10px',
              background: '#000',
              color: '#fff',
              border: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}>
              [заказать] 📦
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
