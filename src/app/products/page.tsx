'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Компонент резинового пунктира
const Dots = () => <div style={{ flex: 1, borderBottom: '2px dotted #000', margin: '0 10px 5px 10px' }} />;

export default function RingProductPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id: 'ring-01', name: 'кольцо <3', price: 1598, size: selectedSize, quantity: 1 });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Навигация (2 заголовка как просил) */}
      <Breadcrumbs path={[
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: 'КОЛЬЦО <3', icon: '⚠' }
      ]} />

      {/* Основная сетка: Фото с квадратами + Описание */}
      <div style={{ display: 'flex', gap: '50px', width: '100%', marginTop: '30px', alignItems: 'flex-start' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ: Большое фото + 4 прилипших квадрата */}
        <div style={{ display: 'flex' }}>
          <div style={{ position: 'relative', border: '1px solid #000', width: '350px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '-11px', left: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
            <div style={{ position: 'absolute', top: '-11px', right: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-11px', left: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-11px', right: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
            
            <img src="/product-cat.svg" alt="product" style={{ width: '80%', height: 'auto' }} />
          </div>
          
          {/* 4 прилипших квадрата */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '50px', height: '50px', border: '1px solid #000', borderLeft: 'none', borderBottom: i === 4 ? '1px solid #000' : 'none', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Описание */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', fontWeight: 800 }}>
            <h1 style={{ margin: 0, fontSize: '26px' }}>кольцо&lt;3</h1>
            <Dots />
            <span style={{ fontSize: '24px', color: 'red', lineHeight: '1' }}>1.598₽</span>
          </div>
          <div style={{ textAlign: 'right', color: '#999', textDecoration: 'line-through', fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>
            3.600₽
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '13px', marginTop: '20px' }}>
            <Dots /><span>made.with.love</span><Dots />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
            <img src="/desc-cat.svg" alt="cat" style={{ width: '100px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><Dots /><span>материал</span></div>
              <div style={{ textAlign: 'right', fontSize: '13px' }}>хирургическая сталь</div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '10px' }}><Dots /><span>доставка</span></div>
              <div style={{ textAlign: 'right', fontSize: '13px' }}>по всему РФ+СНГ</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', fontWeight: 700, fontSize: '12px', marginTop: '20px' }}>
            <Dots /><span>выбери размер</span>
          </div>

          {/* Размеры */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', fontSize: '20px', fontWeight: 800 }}>
            {[16, 17, 18, 19].map((size) => (
              <span key={size} onClick={() => setSelectedSize(size)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                [ <span style={{ 
                    color: selectedSize === size ? 'red' : '#000',
                    border: selectedSize === size ? '2px solid red' : 'none',
                    borderRadius: '50%',
                    padding: '2px 4px',
                    margin: '0 4px'
                  }}>
                  {size}
                </span> ]
              </span>
            ))}
          </div>

          {/* Кнопка */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 600, fontSize: '12px', lineHeight: '1.4' }}>
              произведём....<br/>
              упакуем.......<br/>
              и доставим....
            </div>
            <button 
              onClick={handleAddToCart}
              style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              [+добавить в 🛒'y]
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
