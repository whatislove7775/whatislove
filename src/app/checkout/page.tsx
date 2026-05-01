'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: 'ЗАКАЗ', icon: '💳' }
      ]} />
      
      {/* Дальше форма заказа... */}

      {/* Основной блок оформления */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '400px', margin: '0 auto' }}>
        
        {/* Краткая сводка товара (берем первый товар для дизайна) */}
        {items.length > 0 && (
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '100px', height: '100px', backgroundColor: '#e5e5e5', border: '1px solid #000', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
              3&lt;
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>{items[0].name} &nbsp;&nbsp; {items[0].quantity} [+] [-]</div>
              <div>{items[0].price}₽ со скидкой</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>хирургическая сталь<br/>размер: [{items[0].size}]</div>
            </div>
          </div>
        )}

        {/* Форма данных для доставки */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>данные для доставки:</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>ФИО получателя (полностью)</label>
            <input type="text" placeholder="Петров Петр Петрович" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>email</label>
            <input type="email" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>телефон</label>
            <input type="tel" placeholder="+7 (000) 000-00 00" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>telegram</label>
            <input type="text" placeholder="@username" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>город</label>
            <input type="text" placeholder="Москва" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>служба доставки</label>
            <select style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', appearance: 'none' }}>
              <option>СДЭК ▾</option>
              <option>5post</option>
              <option>Яндекс Маркет</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px' }}>пункт выдачи</label>
            <input type="text" placeholder="введите адрес" style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
          </div>

          {/* Заглушка под карту ПВЗ */}
          <div style={{ width: '100%', height: '200px', border: '1px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px' }}>
            КАРТА с теми пунктами выдачи,<br/>
            которые есть в выбранной<br/>
            пользователем службе доставки
          </div>

          {/* Блок оплаты */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <label style={{ fontSize: '14px' }}>оплата</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ border: '1px solid #000', padding: '10px 20px', fontWeight: 'bold' }}>СБП</button>
              <div style={{ border: '1px solid #ccc', width: '60px', height: '40px' }}></div>
              <div style={{ border: '1px solid #ccc', width: '60px', height: '40px' }}></div>
              <div style={{ border: '1px solid #ccc', width: '60px', height: '40px' }}></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
