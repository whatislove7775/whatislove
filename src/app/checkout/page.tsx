'use client';

import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  // Исправляем ошибку: достаем items из стора правильно
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice());

  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: 'ЗАКАЗ', icon: '💳' }
      ]} />

      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Информация о товаре (как на макете оплата заказа.jpg) */}
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id + item.size} style={{ display: 'flex', gap: '20px', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-5px', left: '-5px' }}>+</div>
                <div style={{ position: 'absolute', top: '-5px', right: '-5px' }}>+</div>
                <div style={{ position: 'absolute', bottom: '-5px', left: '-5px' }}>+</div>
                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px' }}>+</div>
                <div style={{ width: '120px', height: '120px', backgroundColor: '#e5e5e5', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  3&lt;
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{item.name}</span>
                  <span>{item.quantity} [+] [-]</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>{item.price}₽ со скидкой</div>
                <div style={{ fontSize: '14px', marginTop: '10px' }}>
                  хирургическая сталь<br/>
                  размер:<br/>
                  [{item.size === 16 ? '(16)' : '16'}][{item.size === 17 ? '(17)' : '17'}][{item.size === 18 ? '(18)' : '18'}][{item.size === 19 ? '(19)' : '19'}]
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center' }}>корзина пуста</div>
        )}

        {/* Форма (как на макете оплата заказа-1.jpg) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <span>данные для доставки:</span>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>ФИО получателя (полностью)</label>
            <input type="text" placeholder="Петров Петр Петрович" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>email</label>
            <input type="email" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>телефон</label>
            <input type="tel" placeholder="+7 (000) 000-00 00" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>telegram</label>
            <input type="text" placeholder="@username" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>город</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Москва" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
              <span style={{ position: 'absolute', right: '10px', top: '10px' }}>🔍</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>служба доставки</label>
            <select style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', appearance: 'none', background: 'white' }}>
              <option>СДЭК ▾</option>
              <option>5post</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px' }}>пункт выдачи</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="введите адрес" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
              <span style={{ position: 'absolute', right: '10px', top: '10px' }}>🔍</span>
            </div>
          </div>

          {/* Заглушка под карту */}
          <div style={{ width: '100%', height: '220px', border: '1px solid #ccc', padding: '40px', textAlign: 'center', fontSize: '12px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            КАРТА с теми пунктами выдачи,<br/>которые есть в выбранной<br/>пользователем службе доставки
          </div>

          {/* Оплата */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span>оплата</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ border: '1px solid #000', padding: '5px 15px', fontWeight: 'bold' }}>СБП</button>
              <div style={{ width: '50px', height: '30px', border: '1px solid #ccc' }}></div>
              <div style={{ width: '50px', height: '30px', border: '1px solid #ccc' }}></div>
              <div style={{ width: '50px', height: '30px', border: '1px solid #ccc' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
