'use client';

import { useCartStore } from '../store/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();

  return (
    <div style={{
      position: 'fixed',
      top: '100px', // Сдвинули вниз, чтобы не перекрывать хедер
      right: '40px', // Отодвинули от края
      width: '200px',
      backgroundColor: 'transparent', // Убрали белый фон
      fontFamily: 'inherit',
      fontSize: '14px',
      zIndex: 100
    }}>
      
      {/* Штрихкод из макета */}
      <pre className="ascii-art" style={{ fontSize: '10px', marginBottom: '15px', fontWeight: 'bold' }}>
{`
 ▄▄▄▄▄ ▄▄▄ ▄▄ ▄▄▄▄▄
 █ ▄▄█ █▄█ █▄ █ ▄▄█
 █▄▄▄█ ▄▄▄ ▄▄ █▄▄▄█
 ▀▀▀▀▀ ▀▀▀ ▀▀ ▀▀▀▀▀
`}
      </pre>

      <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>
        корзина [{items.reduce((acc, item) => acc + item.quantity, 0)}]
      </div>

      {items.length === 0 ? (
        <div style={{ color: '#666' }}>пусто...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {items.map((item, index) => (
            <div key={index}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{item.name} {item.size && `[${item.size}]`}</span>
                <span style={{ cursor: 'pointer' }} onClick={() => removeItem(item.id, item.size)}>[x]</span>
              </div>
              <div>{item.price * item.quantity}₽</div>
            </div>
          ))}
          
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>итого:<br/>{totalPrice()}₽</div>
            
            {/* Переход на страницу оформления заказа */}
            <Link href="/checkout" style={{ fontWeight: 'bold', textDecoration: 'none' }}>
              [заказать] 📦
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
