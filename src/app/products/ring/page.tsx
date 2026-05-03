'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
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
        paddingRight: '140px', // Блокировка от наезда корзины
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, width: '450px' }}>
          
          {/* Главное фото */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}>
              {/* Крестики строго по углам */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, lineHeight: 1 }}>+</div>
              
              {/* Сюда вставишь <img ... /> */}
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 800 }}>&lt;333*</div>
          </div>

          {/* Вертикальные миниатюры */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '70px', flexShrink: 0 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
          
          {/* Заголовок и Цена */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '15px' }}>
            <span style={{ fontWeight: 800 }}>кольцо&lt;3</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            {/* Цены выровнены одна над другой */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
              <span style={{ color: '#d32f2f', fontWeight: 800 }}>1.598₽</span>
              <span style={{ fontWeight: 800, textDecoration: 'line-through', textDecorationThickness: '1.5px' }}>
                3.600₽
              </span>
            </div>
          </div>

          {/* made.with.love */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', position: 'relative', top: '-1px' }}></div>
            <span style={{ fontWeight: 800, margin: '0 10px' }}>made.with.love</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', position: 'relative', top: '-1px' }}></div>
          </div>

          {/* ASCII Кот и Характеристики (ЕДИНЫЙ ТЕКСТОВЫЙ БЛОК) */}
          <div style={{ 
            width: '100%', 
            whiteSpace: 'pre-wrap', 
            lineHeight: '1.4', 
            fontWeight: 500,
            overflow: 'hidden' 
          }}>
            <span style={{ letterSpacing: '0px' }}>... /\_/\ .. ♡</span>.................................................................... <span style={{ fontWeight: 800 }}>материал</span>{'\n'}
            <span style={{ letterSpacing: '0px' }}>{'> ( •  • ) <'}</span>......................................................... хирургическая сталь{'\n'}
            <span style={{ letterSpacing: '0px' }}>{`...   |    | \\_`}</span>............................................................................{'\n'}
            <span style={{ letterSpacing: '0px' }}>{`...   | |  |  )_`}</span>.................................................................... <span style={{ fontWeight: 800 }}>доставка</span>{'\n'}
            <span style={{ letterSpacing: '0px' }}>{`\`\`\`L--L-- / /\`\`\`\``}</span>............................................................. по всему РФ+СНГ{'\n'}
            <span style={{ letterSpacing: '0px' }}>{`........ \\\\ `}</span>................................................................................{'\n'}
            <span style={{ letterSpacing: '0px' }}>{`......... V `}</span>................................................................... <span style={{ fontWeight: 800 }}>выбери размер</span>
          </div>

          {/* Выбор размера [16][(17)][18][19] */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px', fontWeight: 800 }}>
            {[16, 17, 18, 19].map((size) => {
              const isSelected = selectedSize === size;
              return (
                <span 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  {isSelected ? (
                    <span style={{ color: '#d32f2f' }}>[({size})]</span>
                  ) : (
                    <span>[{size}]</span>
                  )}
                </span>
              );
            })}
          </div>

          {/* Нижний блок: Текст слева, Кнопка справа */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 500, lineHeight: 1.4 }}>
              произведём....<br/>
              упакуем.......<br/>
              и доставим....
            </div>
            <button 
              onClick={handleAddToCart}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontWeight: 800, 
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0
              }}
            >
              [+добавить в 🛒'y]
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
