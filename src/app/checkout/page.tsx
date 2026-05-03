'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, updateQuantity, totalPrice, clearCart } = useCartStore();
  const [address, setAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Безопасная загрузка виджета СДЭК (защита от дублирования внизу страницы)
  useEffect(() => {
    const container = document.getElementById('cdek-map');
    if (!container || items.length === 0) return; // Ждем пока появится блок карты

    const init = () => {
      if (!(window as any)._cdekWidgetLoaded && container.innerHTML === '') {
        (window as any)._cdekWidgetLoaded = true;
        new (window as any).CDEKWidget({
          from: 'Москва',
          root: 'cdek-map',
          apiKey: 'c18d2701-3a00-462e-9e83-6e1547bab5a3', // Твой рабочий ключ Яндекса
          servicePath: '/api/cdek',
          defaultLocation: 'Москва',
          onChoose: (type: any, tariff: any, addressInfo: any) => {
            setAddress(addressInfo.address || addressInfo.name || 'Выбран ПВЗ');
          }
        });
      }
    };

    if ((window as any).CDEKWidget) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3';
      script.onload = init;
      document.body.appendChild(script);
    }
  }, [items.length]); // Перезапускаем, если корзина обновилась

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const orderData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      tg: formData.get('tg'),
      city: formData.get('city'),
      delivery: formData.get('delivery'),
      address: address,
      items: items,
      total: totalPrice()
    };

    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
        <h1 style={{ fontWeight: 800, textTransform: 'uppercase' }}>ЗАКАЗ УСПЕШНО ОФОРМЛЕН! &lt;3</h1>
        <p style={{ fontWeight: 500, marginTop: '20px' }}>Мы свяжемся с тобой в Telegram для подтверждения.</p>
        <Link href="/" style={{ marginTop: '40px', fontWeight: 700, textDecoration: 'none', color: '#000', border: '1px solid #000', padding: '10px 20px' }}>
          [ вернуться на главную ]
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      
      <div style={{ width: '100%' }}>
        <Breadcrumbs path={[
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' }
        ]} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', marginTop: '20px' }}>
        
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', fontWeight: 700, marginTop: '50px' }}>корзина пуста...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {items.map((item, idx) => (
              <div key={`${item.id}-${item.size}-${idx}`} style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                
                {/* Идеальная рамка с крестиками прямо на границах */}
                <div style={{ width: '120px', height: '120px', backgroundColor: '#e5e5e5', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                  <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                  <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: '0.5' }}>+</div>
                  <span style={{ fontWeight: 800, fontSize: '20px' }}>3&lt;</span>
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '14px', textTransform: 'lowercase' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span style={{ fontSize: '16px' }}>{item.name}</span>
                    
                    {/* Функциональные плюсики и минусики */}
                    <span style={{ userSelect: 'none' }}>
                      {item.quantity} 
                      <span onClick={() => updateQuantity(item.id, item.size, 1)} style={{ cursor: 'pointer', margin: '0 4px', color: '#000' }}>[+]</span>
                      <span onClick={() => updateQuantity(item.id, item.size, -1)} style={{ cursor: 'pointer', color: '#000' }}>[-]</span>
                    </span>
                  </div>
                  
                  {/* РЕАЛЬНАЯ ЦЕНА (Умножаем на количество) */}
                  <div style={{ fontWeight: 800, marginTop: '5px' }}>
                    {item.price * item.quantity}₽ со скидкой
                  </div>
                  
                  <div style={{ marginTop: '15px', lineHeight: '1.4' }}>
                    хирургическая сталь<br/>
                    размер:<br/>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>
                      {[16, 17, 18, 19].map((s) => {
                        const isSelected = item.size === s;
                        return (
                          <span key={s} style={{ color: isSelected ? 'red' : '#000' }}>
                            [{isSelected ? `(${s})` : s}]
                          </span>
                        );
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div style={{ fontWeight: 700, marginBottom: '20px', textTransform: 'lowercase' }}>данные для доставки:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>ФИО получателя (полностью)</label>
                <input name="name" required type="text" placeholder="Петров Петр Петрович" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>email</label>
                <input name="email" required type="email" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>телефон</label>
                <input name="phone" required type="tel" placeholder="+7 (000) 000-00 00" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>telegram</label>
                <input name="tg" required type="text" placeholder="@username" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>город</label>
                <div style={{ position: 'relative' }}>
                  <input name="city" required type="text" placeholder="Москва" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
                  <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>служба доставки</label>
                <select name="delivery" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box', appearance: 'none', background: 'white' }}>
                  <option value="СДЭК">СДЭК ▾</option>
                  <option value="5post">5post</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>пункт выдачи</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={address} readOnly placeholder="выберите на карте ниже" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#f5f5f5' }} />
                  <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
                </div>
              </div>

              <div id="cdek-map" style={{ width: '100%', height: '400px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}></div>

              <button 
                type="submit" 
                disabled={isLoading || !address}
                style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '16px', cursor: (isLoading || !address) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', textAlign: 'right', marginTop: '20px', opacity: (isLoading || !address) ? 0.5 : 1 }}
              >
                {isLoading ? '[отправка...]' : '[заказать] 📦'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
