'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function RingPage() {
  const [selectedSize, setSelectedSize] = useState(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: 'ring-1',
      name: 'кольцо <3',
      price: 1598,
      size: selectedSize,
      quantity: 1
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'КОЛЬЦО <3', icon: '💍' }
        ]} />
      </div>

      {/* ОСНОВНОЙ БЛОК ТОВАРА */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        gap: '40px', 
        marginTop: '20px',
        alignItems: 'flex-start',
        paddingRight: '140px', // Отступ от корзины
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, width: '450px' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '70px', flexShrink: 0 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px', fontSize: '14px', lineHeight: '1.2' }}>
          
          {/* наименование ... кольцо <3 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800 }}>наименование</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            <span style={{ fontWeight: 800 }}>кольцо &lt;3</span>
          </div>

          {/* цена ... 3 600 1 598 руб */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800 }}>цена</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 800 }}>3 600</span>
              <span style={{ color: '#d32f2f', fontWeight: 800 }}>1 598 руб</span>
            </div>
          </div>

          {/* ... сделано с любовью ... */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', position: 'relative', top: '-4px' }}></div>
            <span style={{ fontWeight: 500, margin: '0 8px' }}>сделано с любовью</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', position: 'relative', top: '-4px' }}></div>
          </div>

          {/* Разделитель */}
          <div style={{ width: '100%', borderBottom: '1.5px dotted #000', marginBottom: '8px' }}></div>

          {/* материал ... ювелирная сталь */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800 }}>материал</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            <span style={{ fontWeight: 500 }}>ювелирная сталь</span>
          </div>

          {/* Разделитель */}
          <div style={{ width: '100%', borderBottom: '1.5px dotted #000', marginBottom: '8px' }}></div>

          {/* доставка ... по всей России */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800 }}>доставка</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            <span style={{ fontWeight: 500 }}>по всей России</span>
          </div>

          {/* ... +страны СНГ */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            <span style={{ fontWeight: 500 }}>+страны СНГ</span>
          </div>

          {/* Разделитель */}
          <div style={{ width: '100%', borderBottom: '1.5px dotted #000', marginBottom: '8px' }}></div>

          {/* ... выбери размер ниже ... */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '8px' }}>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', position: 'relative', top: '-4px' }}></div>
            <span style={{ fontWeight: 800, margin: '0 8px' }}>выбери размер ниже</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', position: 'relative', top: '-4px' }}></div>
          </div>

          {/* Разделитель */}
          <div style={{ width: '100%', borderBottom: '1.5px dotted #000', marginBottom: '25px' }}></div>

          {/* ВЫБОР РАЗМЕРА */}
          <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 800, alignItems: 'center' }}>
            {[16, 17, 18, 19].map((size) => (
              <span 
                key={size} 
                onClick={() => setSelectedSize(size)}
                style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', margin: '0 5px' }}
              >
                [ 
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#000', 
                  border: selectedSize === size ? '1.5px solid #d32f2f' : '1.5px solid transparent', 
                  borderRadius: '50%', 
                  width: '24px', 
                  height: '24px', 
                  margin: '0 4px' 
                }}>
                  {size}
                </span> 
                ]
              </span>
            ))}
          </div>

          {/* НИЖНИЙ БЛОК */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 500, lineHeight: 1.4 }}>
              произведём, упакуем,<br/>
              и доставим
            </div>
            <button 
              onClick={handleAddToCart}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontWeight: 800, 
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
                fontSize: '14px'
              }}
            >
              [ +добавить в 🛒'y ]
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
