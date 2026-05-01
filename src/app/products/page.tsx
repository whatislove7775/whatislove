'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function RingProductPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id: 'ring-01', name: 'кольцо <3', price: 1598, size: selectedSize, quantity: 1 });
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Навигация */}
      <Breadcrumbs path={[
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: '에고 크리드,안녕하세요', icon: '💍' },
        { name: 'КОЛЬЦО <3', icon: '⚠' }
      ]} />

      {/* Основной блок: Строго две колонки (Сетка) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'stretch' }}>
        
        {/* ЛЕВАЯ КОЛОНКА: Изображение с крестиками */}
        <div style={{ 
          position: 'relative', 
          border: '1px solid #000', 
          aspectRatio: '1/1', 
          padding: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          {/* Крестики строго на пересечении углов */}
          <div style={{ position: 'absolute', top: '-11px', left: '-6px', fontSize: '20px', fontWeight: 300, lineHeight: 1 }}>+</div>
          <div style={{ position: 'absolute', top: '-11px', right: '-6px', fontSize: '20px', fontWeight: 300, lineHeight: 1 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-11px', left: '-6px', fontSize: '20px', fontWeight: 300, lineHeight: 1 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-11px', right: '-6px', fontSize: '20px', fontWeight: 300, lineHeight: 1 }}>+</div>
          
          <img src="/product-cat.svg" alt="ring" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* ПРАВАЯ КОЛОНКА: Описание и цены */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          <h1 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 5px 0', letterSpacing: '-1px' }}>
            кольцо&lt;3
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
            <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', fontFamily: "'Courier New', Courier, monospace", fontSize: '18px', fontWeight: 'bold' }}>
              ...........................................................................
            </div>
            <div style={{ color: 'red', fontSize: '28px', fontWeight: 800, marginLeft: '10px', lineHeight: '1' }}>
              1.598₽
            </div>
          </div>
          
          <div style={{ textAlign: 'right', color: '#999', textDecoration: 'line-through', fontSize: '20px', fontWeight: 700, marginTop: '5px' }}>
            3.600₽
          </div>

          {/* Блок с SVG-котиком и характеристиками */}
          <div style={{ marginTop: '30px' }}>
            <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', fontSize: '15px', letterSpacing: '1px', textAlign: 'center' }}>
              .......................made.with.love.......................
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
              {/* Твой SVG Котик */}
              <img src="/desc-cat.svg" alt="cat" style={{ width: '110px', flexShrink: 0 }} />
              
              {/* Характеристики (выровнены вправо) */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'right', gap: '4px' }}>
                <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  ........................................материал
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>хирургическая сталь</div>
                
                <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', marginTop: '10px' }}>
                  ........................................доставка
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>по всему РФ+СНГ</div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontFamily: "'Courier New', Courier, monospace", fontWeight: 'bold', fontSize: '14px', marginTop: '15px' }}>
              ............................выбери размер
            </div>
          </div>

          {/* Размеры */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px', fontSize: '22px', fontWeight: 800 }}>
            {[16, 17, 18, 19].map((size) => (
              <span 
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{ cursor: 'pointer', color: selectedSize === size ? 'red' : '#000' }}
              >
                [ {size} ]
              </span>
            ))}
          </div>

          {/* Нижний блок (кнопка корзины) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '30px' }}>
            <div style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: 600, fontSize: '14px', lineHeight: '1.4' }}>
              произведём....<br/>
              упакуем.......<br/>
              и доставим....
            </div>
            {/* Черная кнопка по макету */}
            <button 
              onClick={handleAddToCart}
              style={{ background: '#000', color: '#fff', border: 'none', padding: '10px 18px', fontWeight: 800, fontSize: '18px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
            >
              [ +добавить в 🛒'y ]
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
