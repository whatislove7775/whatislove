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
            {/* Обертка с padding, чтобы крестики не прилипали к фото */}
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              {/* Крестики строго по углам внешней границы */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              
              {/* Само прямоугольное фото */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '70px', flexShrink: 0, paddingTop: '15px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
          
          {/* ЧИСТО ТЕКСТОВЫЙ БЛОК ОПИСАНИЯ (<pre> с вручную подобранными точками для идеально ровного края) */}
          <pre style={{ 
            width: '100%', 
            whiteSpace: 'pre', 
            fontFamily: 'inherit',
            fontSize: '14px',
            lineHeight: '1.4', 
            fontWeight: 500,
            overflow: 'hidden',
            margin: 0
          }}>
            <span style={{ fontWeight: 800 }}>наименование</span>{` ................................................................ `}<span style={{ fontWeight: 800 }}>кольцо &lt;3</span>{'\n'}
            <span style={{ fontWeight: 800 }}>цена</span>{` ........................................................... `}<span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 800 }}>3 600</span> <span style={{ color: '#d32f2f', fontWeight: 800 }}>1 598 руб</span>{'\n'}
            {`................................ `}<span style={{ fontWeight: 500 }}>сделано с любовью</span>{` .................................`}{'\n'}
            {`.....................................................................................................`}{'\n'}
            <span style={{ fontWeight: 800 }}>материал</span>{` ................................................................. `}<span style={{ fontWeight: 500 }}>ювелирная сталь</span>{'\n'}
            {`.....................................................................................................`}{'\n'}
            <span style={{ fontWeight: 800 }}>доставка</span>{` ..................................................................... `}<span style={{ fontWeight: 500 }}>по всей России</span>{'\n'}
            {`....................................................................................... `}<span style={{ fontWeight: 500 }}>+страны СНГ</span>{'\n'}
            {`.....................................................................................................`}{'\n'}
            {`................................ `}<span style={{ fontWeight: 800 }}>выбери размер ниже</span>{` ................................`}{'\n'}
            {`.....................................................................................................`}
          </pre>

          {/* ВЫБОР РАЗМЕРА [16] (17) [18] [19] */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', fontWeight: 800, alignItems: 'center' }}>
            {[16, 17, 18, 19].map((size) => (
              <span 
                key={size} 
                onClick={() => setSelectedSize(size)}
                style={{ cursor: 'pointer', userSelect: 'none', margin: '0 8px', display: 'flex', alignItems: 'center' }}
              >
                {selectedSize === size ? (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#d32f2f', 
                    border: '1.5px solid #d32f2f', 
                    borderRadius: '50%', 
                    width: '26px', 
                    height: '26px' 
                  }}>
                    {size}
                  </span>
                ) : (
                  `[ ${size} ]`
                )}
              </span>
            ))}
          </div>

          {/* НИЖНИЙ БЛОК: Текст слева, Кнопка справа */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 500, lineHeight: 1.4, fontSize: '14px' }}>
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
