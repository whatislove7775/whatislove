'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      
      {/* Навигация на всю ширину. Убрал дубль WH4T!SLOV3 */}
      <div style={{ width: '100%' }}>
        <Breadcrumbs path={[
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'ЗАКАЗ', icon: '💳' }
        ]} />
      </div>

      {/* Обертка для центрирования контента */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', marginTop: '20px' }}>
        
        {/* Карточка товара */}
        {items.length > 0 && (
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            <div style={{ width: '120px', height: '120px', backgroundColor: '#e5e5e5', border: '1px solid #000', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ position: 'absolute', top: '-7px', left: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', top: '-7px', right: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-7px', left: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-7px', right: '-4px', fontWeight: 300 }}>+</div>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>3&lt;</span>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '14px', textTransform: 'lowercase' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>{items[0].name}</span>
                <span>{items[0].quantity} [+] [-]</span>
              </div>
              <div style={{ fontWeight: 700, marginTop: '5px' }}>
                {items[0].price}₽ со скидкой
              </div>
              <div style={{ marginTop: '15px', lineHeight: '1.4' }}>
                хирургическая сталь<br/>
                размер:<br/>
                <span style={{ fontWeight: 700 }}>
                  [{items[0].size === 16 ? '(16)' : '16'}][{items[0].size === 17 ? '(17)' : '17'}][{items[0].size === 18 ? '(18)' : '18'}][{items[0].size === 19 ? '(19)' : '19'}]
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Форма доставки */}
        <div style={{ fontWeight: 700, marginBottom: '20px', textTransform: 'lowercase' }}>данные для доставки:</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>ФИО получателя (полностью)</label>
            <input type="text" placeholder="Петров Петр Петрович" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>email</label>
            <input type="email" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>телефон</label>
            <input type="tel" placeholder="+7 (000) 000-00 00" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>telegram</label>
            <input type="text" placeholder="@username" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>город</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="Москва" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>служба доставки</label>
            <select style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box', appearance: 'none', background: 'white' }}>
              <option>СДЭК ▾</option>
              <option>5post</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', marginBottom: '5px', textTransform: 'lowercase' }}>пункт выдачи</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="введите адрес" style={{ padding: '12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', width: '100%', boxSizing: 'border-box' }} />
              <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '14px' }}>🔍</span>
            </div>
          </div>

          {/* Заглушка под карту */}
          <div style={{ width: '100%', height: '220px', border: '1px solid #ccc', padding: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase', color: '#999', fontSize: '12px' }}>
            ТУТ БУДЕТ ВИДЖЕТ КАРТЫ СДЭК ДЛЯ ВЫБОРА ПВЗ
          </div>

        </div>
      </div>
    </div>
  );
}
