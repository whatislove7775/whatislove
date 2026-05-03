'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items) || [];
  
  // Получаем общую цену. Проверка на то, является ли это функцией или значением
  const totalPrice = typeof useCartStore((state) => state.totalPrice) === 'function' 
    ? useCartStore((state) => state.totalPrice)() 
    : useCartStore((state) => state.totalPrice) || 0;
    
  const [isLoading, setIsLoading] = useState(false);
  
  // ВЕРНУЛ ВСЕ ПРОПАВШИЕ СТЕЙТЫ
  const [city, setCity] = useState('');
  const [delivery, setDelivery] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryCost, setDeliveryCost] = useState(0);

  // Имитация загрузки виджета СДЭК (сюда вернешь свой скрипт)
  useEffect(() => {
    if (delivery === 'СДЭК') {
      console.log('Загрузка виджета СДЭК для города:', city);
      // Если у тебя был скрипт, он будет цепляться к div с id="cdek-map"
    }
  }, [delivery, city]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return;
    setIsLoading(true);

    const fullTotal = totalPrice + deliveryCost;

    try {
      const formData = new FormData(e.currentTarget);
      
      // ВЕРНУЛ ПОЛНЫЙ СБОР ДАННЫХ ДЛЯ ТВОЕГО ТЕЛЕГРАМ БОТА
      const orderData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        tg: formData.get('tg'),
        city: city,
        delivery: delivery,
        address: address,
        deliveryCost: deliveryCost,
        items: items,
        total: fullTotal,
      };

      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });

      alert('Заказ успешно оформлен! Мы свяжемся с вами.');
      // Тут можно добавить очистку корзины
    } catch (error) {
      alert('Ошибка при оформлении заказа');
    } finally {
      setIsLoading(false);
    }
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* СПИСОК ТОВАРОВ (с ровным визуалом и размерами [(17)]) */}
          {items.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', gap: '20px', marginBottom: '30px', alignItems: 'center' }}>
              
              <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#e5e5e5' }}></div>
              </div>

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
                        <span style={{ color: '#d32f2f' }}>[({size})]</span>
                      ) : (
                        `[${size}]`
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* ПОЛНАЯ ФОРМА С ГОРОДОМ, ДОСТАВКОЙ И СДЭКОМ */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '14px', marginTop: '20px' }}>
            <div style={{ marginBottom: '5px' }}>данные для доставки:</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>ФИО получателя (полностью)</label>
              <input type="text" name="name" placeholder="Петров Петр Петрович" required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>email</label>
              <input type="email" name="email" required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>телефон</label>
              <input type="tel" name="phone" placeholder="+7 (000) 000-00 00" required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>telegram</label>
              <input type="text" name="tg" placeholder="@username" style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            {/* ВЕРНУЛ ГОРОД И СЛУЖБУ ДОСТАВКИ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>город</label>
              <input type="text" name="city" value={city} onChange={(e) => setCity(e.target.value)} required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>служба доставки</label>
              <select name="delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)} required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
                <option value="">выберите службу...</option>
                <option value="СДЭК">СДЭК (до пункта выдачи)</option>
                <option value="Почта России">Почта России</option>
                <option value="Озон">Озон доставка</option>
                <option value="5Post">5Post</option>
              </select>
            </div>

            {/* КОНТЕЙНЕР ДЛЯ ВИДЖЕТА СДЭК */}
            {delivery === 'СДЭК' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
                <label>выберите пункт выдачи на карте:</label>
                <div id="cdek-map" style={{ width: '100%', height: '300px', backgroundColor: '#f9f9f9', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* ТУТ БУДЕТ РЕНДЕРИТСЯ ТВОЯ КАРТА СДЭКА */}
                  <span style={{ color: '#999' }}>[карта СДЭК загружается...]</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px' }}>
              <label>адрес (город, улица, дом, индекс / пункт выдачи)</label>
              <input type="text" name="address" value={address} onChange={(e) => setAddress(e.target.value)} required style={{ border: '1px solid #ccc', padding: '10px', fontFamily: 'inherit', outline: 'none' }} />
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
