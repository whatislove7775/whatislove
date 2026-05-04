'use client';
import { useCartStore } from '../store/cartStore';
import Link from 'next/link';

export default function Cart() {
  const { items, removeItem, totalPrice } = useCartStore();
  const totalItemsCount = items.reduce((acc: any, item: any) => acc + item.quantity, 0);

  return (
    <div style={{
      width: '120px', 
      zIndex: 1000,
      fontWeight: 700,
      fontFamily: 'inherit' 
    }}>
      
      {/* ИСПОЛЬЗУЕМ ТВОЙ ФАЙЛ С КИРИЛЛИЦЕЙ И ПРОБЕЛАМИ */}
      <div style={{ width: '100%', marginBottom: '15px' }}>
        <img 
          src={encodeURI("/куаркод над корзиной.svg")} 
          alt="QR" 
          style={{ width: '100%', height: 'auto', display: 'block' }} 
        />
      </div>

      <div style={{ marginBottom: '10px', textTransform: 'lowercase', fontSize: '14px' }}>
        корзина [{totalItemsCount}]
      </div>

      {items.length === 0 ? (
        <div style={{ fontWeight: 500, textTransform: 'lowercase', fontSize: '14px' }}>пусто...</div>
      ) : (
        <>
          {items.map((item: any, i: number) => (
            <div key={`${item.id}-${item.size}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', fontWeight: 500, textTransform: 'lowercase', fontSize: '12px', lineHeight: 1.2 }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</span>
                  <span style={{ color: 'red', whiteSpace: 'nowrap' }}>[{item.size}]</span>
                </div>
                <span>x{item.quantity}</span>
              </div>
              
              <span onClick={() => removeItem(item.id, item.size)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', height: '16px', marginLeft: '4px' }}>
                [x]
              </span>
              
            </div>
          ))}
          <div style={{ marginTop: '20px', textTransform: 'lowercase', fontSize: '14px' }}>
            итого:<br/>{totalPrice()}₽
          </div>
          <Link href="/checkout" style={{ display: 'block', marginTop: '10px', textTransform: 'lowercase', textDecoration: 'none', color: '#000', fontSize: '14px' }}>[заказать] 📦</Link>
        </>
      )}
    </div>
  );
}
