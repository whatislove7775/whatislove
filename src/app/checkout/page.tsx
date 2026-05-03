'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  // Вытягиваем корзину из стейта
  const items = useCartStore((state) => state.items) || [];
  const totalPrice = useCartStore((state) => state.totalPrice);
  
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);
    
    // Здесь твоя логика отправки в Telegram или ЮKassa, которую мы писали
    // Пока просто имитация загрузки
    setTimeout(() => {
      alert('Заказ отправлен!');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' }
        ]} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '40px', maxWidth: '500px', margin: '40px auto 0' }}>
        
        {/* СПИСОК ТОВАРОВ В КОРЗИНЕ */}
        {items.map((item: any) => (
          <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '40px', alignItems: 'flex-start' }}>
            
            {/* Блок с фото и крестиками */}
            <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}></div>
            </div>

            {/* Инфо о товаре */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                {item.name} 
                <span style={{ fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>{item.quantity} [+] [-]</span>
              </div>
              
              <div style={{ marginTop: '8px', fontSize: '16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 800 }}>
                  {item.quantity * 3600}₽
                </span>
                <span style={{ fontWeight: 800 }}>
                  {item.quantity * item.price}₽ со скидкой
                </span>
              </div>

              <div style={{ marginTop: '10px', fontWeight: 500, fontSize: '14px', lineHeight: 1.4 }}>
                хирургическая сталь<br />
                размер:<br />
                <span style={{ fontWeight: 800, display: 'inline-block', marginTop: '4px' }}>
                  [16][<span style={{ color: '#d32f2f' }}>({item.size || 17})</span>][18][19]
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* ФОРМА ОФОРМЛЕНИЯ ЗАКАЗА */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 500, fontSize: '14px' }}>
          <div style={{ marginBottom: '10px' }}>данные для доставки:</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>ФИО получателя (полностью)</label>
            <input type="text" name="name" placeholder="Петров Петр Петрович" required style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>email</label>
            <input type="email" name="email" required style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>телефон</label>
            <input type="tel" name="phone" placeholder="+7 (000) 000-00 00" required style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>telegram</label>
            <input type="text" name="tg" placeholder="@username" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>адрес (город, улица, дом, индекс)</label>
            <input type="text" name="address" onChange={(e) => setAddress(e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', outline: 'none' }} />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !address}
            style={{ 
              marginTop: '20px',
              background: 'transparent', 
              border: '1px solid #000', 
              padding: '10px 20px',
              fontWeight: 800, 
              fontSize: '16px', 
              cursor: (isLoading || !address) ? 'not-allowed' : 'pointer', 
              fontFamily: 'inherit', 
              opacity: (isLoading || !address) ? 0.5 : 1,
              textTransform: 'uppercase'
            }}
          >
            {isLoading ? '[ОЖИДАНИЕ...]' : '[ ОПЛАТИТЬ ЗАКАЗ ]'}
          </button>
        </form>

      </div>
    </div>
  );
}
