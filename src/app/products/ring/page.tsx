'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Компонент для текстовых точек, который сам заполняет пустоту
const TextDots = () => (
  <span style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', margin: '0 8px', opacity: 0.8, userSelect: 'none' }}>
    ........................................................................................................................................................................................................
  </span>
);

// Сплошная линия из текстовых точек
const FullTextDots = () => (
  <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', userSelect: 'none', lineHeight: 1.2, marginTop: '6px', marginBottom: '6px', opacity: 0.8 }}>
    ........................................................................................................................................................................................................
  </div>
);

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
        paddingRight: '140px',
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
          
          {/* ЧИСТЫЙ ТЕКСТ С ТОЧКАМИ БЕЗ ДЫРОК */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontSize: '14px', lineHeight: '1.4', fontWeight: 500 }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: 800 }}>наименование</span>
              <TextDots />
              <span style={{ fontWeight: 800 }}>кольцо &lt;3</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '4px' }}>
              <span style={{ fontWeight: 800 }}>цена</span>
              <TextDots />
              <span style={{ color: '#999', textDecoration: 'line-through', fontWeight: 800, marginRight: '8px' }}>3 600</span>
              <span style={{ color: '#d32f2f', fontWeight: 800 }}>1 598 руб</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '4px' }}>
              <TextDots />
              <span style={{ fontWeight: 500 }}>сделано с любовью</span>
              <TextDots />
            </div>

            <FullTextDots />

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: 800 }}>материал</span>
              <TextDots />
              <span style={{ fontWeight: 500 }}>ювелирная сталь</span>
            </div>

            <FullTextDots />

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <span style={{ fontWeight: 800 }}>доставка</span>
              <TextDots />
              <span style={{ fontWeight: 500 }}>по всей России</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: '4px' }}>
              <TextDots />
              <span style={{ fontWeight: 500 }}>+страны СНГ</span>
            </div>

            <FullTextDots />

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <TextDots />
              <span style={{ fontWeight: 800 }}>выбери размер ниже</span>
              <TextDots />
            </div>

            <FullTextDots />
            
          </div>

          {/* ВЫБОР РАЗМЕРА */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', fontWeight: 800, alignItems: 'center' }}>
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

          {/* НИЖНИЙ БЛОК */}
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
