'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Компонент для идеальных неломающихся пунктиров
const DottedLine = () => <div style={{ flex: 1, borderBottom: '2px dotted #000', margin: '0 8px 6px 8px' }} />;

export default function RingProductPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id: 'ring-01', name: 'кольцо <3', price: 1598, size: selectedSize, quantity: 1 });
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <Breadcrumbs path={[
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: '에고 크리드,안녕하세요', icon: '💍' },
        { name: 'КОЛЬЦО <3', icon: '⚠' }
      ]} />

      {/* Основная сетка: 3 колонки (Большое фото, Миниатюры, Описание) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 45vh) 60px 1fr', gap: '30px', alignItems: 'stretch' }}>
        
        {/* 1. БОЛЬШОЕ ФОТО */}
        <div style={{ position: 'relative', border: '1px solid #000', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'absolute', top: '-11px', left: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', top: '-11px', right: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-11px', left: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-11px', right: '-6px', fontSize: '20px', fontWeight: 300 }}>+</div>
          
          {/* Сюда вставь фото кольца, пока что котик */}
          <img src="/product-cat.svg" alt="ring" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
        </div>

        {/* 2. МИНИАТЮРЫ (из макета) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: '100%', aspectRatio: '1/1', border: '1px solid #000', backgroundColor: '#e5e5e5' }}></div>
          ))}
        </div>

        {/* 3. ОПИСАНИЕ И ЦЕНА */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Название и цена с пунктиром */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', fontWeight: 800 }}>
            <span style={{ fontSize: '24px' }}>кольцо&lt;3</span>
            <DottedLine />
            <span style={{ color: 'red', fontSize: '24px', lineHeight: '1' }}>1.598₽</span>
          </div>
          <div style={{ textAlign: 'right', textDecoration: 'line-through', color: '#999', fontSize: '16px', fontWeight: 700, marginTop: '2px' }}>
            3.600₽
          </div>

          <div style={{ display: 'flex', alignItems: 'center', width: '100%', fontWeight: 700, fontSize: '13px', marginTop: '10px' }}>
            <DottedLine />
            <span>made.with.love</span>
            <DottedLine />
          </div>

          {/* Блок с Котиком и характеристиками */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <img src="/desc-cat.svg" alt="cat" style={{ width: '120px', flexShrink: 0 }} />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}><DottedLine /><span>материал</span></div>
              <div style={{ textAlign: 'right', fontSize: '14px' }}>хирургическая сталь</div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '10px' }}><DottedLine /><span>доставка</span></div>
              <div style={{ textAlign: 'right', fontSize: '14px' }}>по всему РФ+СНГ</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', fontWeight: 700, fontSize: '13px', marginTop: '15px' }}>
            <DottedLine />
            <span>выбери размер</span>
          </div>

          {/* Выбор размера с красным кружком */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px', fontSize: '20px', fontWeight: 800 }}>
            {[16, 17, 18, 19].map((size) => (
              <span key={size} onClick={() => setSelectedSize(size)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                [ <span style={{ 
                    color: selectedSize === size ? 'red' : '#000',
                    border: selectedSize === size ? '2px solid red' : 'none',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    margin: '0 2px'
                  }}>
                  {size}
                </span> ]
              </span>
            ))}
          </div>

          {/* Кнопка и инфо */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '20px' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: '1.4' }}>
              произведём....<br/>
              упакуем.......<br/>
              и доставим....
            </div>
            <button 
              onClick={handleAddToCart}
              style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '16px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              [ +добавить в 🛒'y ]
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
