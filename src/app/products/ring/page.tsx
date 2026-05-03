'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Идеальная пунктирная линия для выравнивания
const DottedLine = () => (
  <div style={{ 
    flex: 1, 
    borderBottom: '2px dotted #000', 
    margin: '0 8px', 
    position: 'relative', 
    top: '-4px',
    opacity: 0.8 
  }}></div>
);

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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      
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
        gap: '60px', 
        marginTop: '30px',
        alignItems: 'flex-start',
        flexWrap: 'wrap' // Для адаптивности на мелких экранах
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '15px', flex: '1 1 45%', minWidth: '350px' }}>
          
          {/* Главное фото */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Крестики по углам */}
              <div style={{ position: 'absolute', top: -20, left: -10, fontSize: '24px', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: -20, right: -10, fontSize: '24px', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: -15, left: -10, fontSize: '24px', fontWeight: 300, lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: -15, right: -10, fontSize: '24px', fontWeight: 300, lineHeight: 1 }}>+</div>
              
              {/* Серый квадрат (заглушка) / Сюда вставь тег <img> с твоей фоткой кольца */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            </div>
            {/* Надпись под главным фото */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          {/* Вертикальные миниатюры (4 штуки) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '80px', flexShrink: 0 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>

        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: '1 1 45%', minWidth: '350px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Заголовок и Цена */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '15px' }}>
            <span style={{ fontWeight: 800, fontSize: '18px' }}>кольцо&lt;3</span>
            <DottedLine />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1 }}>
              <span style={{ color: '#d32f2f', fontWeight: 800, fontSize: '22px' }}>1.598₽</span>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '14px', 
                textDecoration: 'line-through', 
                textDecorationColor: '#d32f2f', 
                textDecorationThickness: '2px', 
                marginTop: '6px' 
              }}>
                3.600₽
              </span>
            </div>
          </div>

          {/* made.with.love */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
            <DottedLine />
            <span style={{ fontWeight: 800, fontSize: '12px', margin: '0 10px' }}>made.with.love</span>
            <DottedLine />
          </div>

          {/* ASCII Кот и Характеристики (Идеально выровненные) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px', lineHeight: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>... /\_/\ .. ♡</span>
              <DottedLine />
              <span style={{ fontWeight: 800, textAlign: 'right' }}>материал</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{'> ( •  • ) <'}</span>
              <DottedLine />
              <span style={{ fontWeight: 500, textAlign: 'right' }}>хирургическая сталь</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{'...   |    | \\_'}</span>
              <DottedLine />
              <span></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{'...   | |  |  )_'}</span>
              <DottedLine />
              <span style={{ fontWeight: 800, textAlign: 'right' }}>доставка</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{'```L--L-- / /````'}</span>
              <DottedLine />
              <span style={{ fontWeight: 500, textAlign: 'right' }}>по всему РФ+СНГ</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{'........ \\\\ '}</span>
              <DottedLine />
              <span></span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
              <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{'......... V '}</span>
              <DottedLine />
              <span style={{ fontWeight: 800, textAlign: 'right' }}>выбери размер</span>
            </div>
          </div>

          {/* Выбор размера (Красный круг как в макете) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', fontWeight: 800, fontSize: '16px' }}>
            {[16, 17, 18, 19].map((size) => {
              const isSelected = selectedSize === size;
              return (
                <span 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
                >
                  [ <span style={{ 
                    margin: '0 4px', 
                    color: isSelected ? '#d32f2f' : '#000',
                    border: isSelected ? '1.5px solid #d32f2f' : '1.5px solid transparent',
                    borderRadius: '50%',
                    padding: '2px 5px',
                    lineHeight: 1
                  }}>
                    {size}
                  </span> ]
                </span>
              );
            })}
          </div>

          {/* Нижний блок: Текст слева, Кнопка справа */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 500, fontSize: '13px', lineHeight: 1.4 }}>
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
                fontSize: '15px', 
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
