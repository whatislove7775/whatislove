'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items) || [];
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);
    setTimeout(() => {
      alert('Заказ отправлен!');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' }
        ]} />
      </div>

      {/* Центрируем весь блок чекаута как в оригинале */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* СПИСОК ТОВАРОВ */}
          {items.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
              
              {/* Фото с крестиками */}
              <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}></div>
              </div>

              {/* Инфо */}
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', lineHeight: '1.4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px' }}>{item.name}</span>
                  <span style={{ fontWeight: 800 }}>{item.quantity} [+] [-]</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', fontWeight: 800, marginTop: '2px' }}>
                  <span style={{ color: '#999', textDecoration: 'line-through' }}>{item.quantity * 3600}₽</span>
                  <span>{item.quantity * item.price}₽ со скидкой</span>
                </div>

                <div style={{ marginTop: '4px' }}>хирургическая сталь</div>
                <div>размер:</div>
                <div style={{ fontWeight: 800, marginTop: '2px', display: 'flex', alignItems: 'center' }}>
                  {[16, 17, 18, 19].map((size) => (
                    <span key={size}>
                      {item.size === size ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', border: '1.5px solid #d32f2f', borderRadius: '50%', width: '22px', height: '22px', margin: '0 2px' }}>
                          {size}
                        </span>
                      ) : (
                        `[${size}]`
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* ФОРМА */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', marginTop: '20px' }}>
            <div style={{ marginBottom: '5px' }}>данные для доставки:</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>ФИО получателя (полностью)</label>
              <input type="text" placeholder="Петров Петр Петрович" required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>email</label>
              <input type="email" required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>телефон</label>
              <input type="tel" placeholder="+7 (000) 000-00 00" required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>telegram</label>
              <input type="text" placeholder="@username" style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>адрес (город, улица, дом, индекс)</label>
              <input type="text" onChange={(e) => setAddress(e.target.value)} required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !address}
              style={{ 
                marginTop: '10px',
                background: 'transparent', 
                border: 'none', 
                fontWeight: 800, 
                fontSize: '15px', 
                cursor: (isLoading || !address) ? 'not-allowed' : 'pointer', 
                fontFamily: 'inherit', 
                opacity: (isLoading || !address) ? 0.5 : 1,
                alignSelf: 'flex-start'
              }}
            >
              {isLoading ? '[ОЖИДАНИЕ...]' : '[заказать] 📦'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
