'use client';
import { useCartStore } from '../store/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: '20px', /* Строго на уровне Breadcrumbs */
      right: '20px', 
      width: '160px', 
      zIndex: 1000, 
      textAlign: 'left', 
      fontSize: '12px', 
      fontWeight: 700 
    }}>
      {/* QR Код */}
      <div style={{ width: '80px', height: '80px', marginBottom: '10px' }}>
        <img src="/куаркод над корзиной.svg" alt="QR" style={{ width: '100%', height: '100%' }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', textTransform: 'uppercase' }}>
        <span>корзина [{items.length}]</span>
        {items.length > 0 && <span style={{ cursor: 'pointer' }}>[x]</span>}
      </div>
      
      {items.length === 0 ? (
        <div style={{ fontWeight: 500 }}>пусто...</div>
      ) : (
        <>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 500 }}>
              <span style={{ textTransform: 'uppercase' }}>{item.name}</span>
              <span onClick={() => removeItem(item.id, item.size)} style={{ cursor: 'pointer' }}>[x]</span>
            </div>
          ))}
          <div style={{ marginTop: '10px', borderTop: '1px dotted #000', paddingTop: '10px', textTransform: 'uppercase' }}>
            итого:<br/>{totalPrice()}₽
          </div>
          <Link href="/checkout" style={{ display: 'block', marginTop: '10px', textTransform: 'uppercase' }}>[заказать] 📦</Link>
        </>
      )}
    </div>
  );
}
