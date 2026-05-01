'use client';
import { useCartStore } from '../store/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();
  
  // Условие: корзина видна только если в ней что-то есть
  if (items.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: '20px', right: '40px', width: '150px', zIndex: 1000, textAlign: 'center' }}>
      
      {/* Твой реальный QR-код из SVG (не меняем форму) */}
      <div style={{ width: '100px', height: '100px', margin: '0 auto 10px' }}>
        <img src="/куаркод над корзиной.svg" alt="QR" style={{ width: '100%', height: '100%' }} />
      </div>
      
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'left' }}>
        корзина [{items.length}]
      </div>
      
      <div style={{ textAlign: 'left', fontSize: '13px' }}>
        {items.map((item, i) => (
          <div key={i} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.name}</span>
            <span onClick={() => removeItem(item.id, item.size)} style={{ cursor: 'pointer' }}>[x]</span>
          </div>
        ))}

        <div style={{ borderTop: '1px dashed #000', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold' }}>
          итого:<br/>
          {totalPrice()}₽
        </div>

        <Link href="/checkout" style={{ display: 'inline-block', marginTop: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
          [заказать] 📦
        </Link>
      </div>
    </div>
  );
}
