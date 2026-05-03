'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Идеальная пунктирная линия, подогнанная под 14px шрифт
const DottedLine = () => (
  <div style={{ 
    flex: 1, 
    borderBottom: '1.5px dotted #000', 
    margin: '0 8px', 
    position: 'relative', 
    top: '-4px' 
  }}></div>
);

// Строка с котом: жестко фиксирует левую и правую часть, заполняя пустоту точками
const SpecRow = ({ cat, text, isBold = false }: { cat: string, text: string, isBold?: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '4px', lineHeight: 1.2 }}>
    <span style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{cat}</span>
    {text ? <DottedLine /> : <div style={{ flex: 1 }}></div>}
    <span style={{ fontWeight: isBold ? 800 : 500, textAlign: 'right' }}>{text}</span>
  </div>
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

      {/* ОСНОВНОЙ БЛОК ТОВАРА (с отступом справа для корзины) */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        gap: '40px', 
        marginTop: '20px',
        alignItems: 'flex-start',
        paddingRight: '140px', // Блокировка от наезда на корзину
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, width: '450px' }}>
          
          {/* Главное фото */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Обертка с padding, чтобы крестики торчали по углам */}
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, fontWeight: 300 }}>+</div>
              
              {/* Заглушка для фото */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800 }}>&lt;333*</div>
          </div>

          {/* Вертикальные миниатюры */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '70px', paddingTop: '15px', flexShrink: 0 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
          
          {/* Заголовок и Цена (Цена сделана как наклейка поверх зачеркнутой) */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '15px' }}>
            <span style={{ fontWeight: 800 }}>кольцо&lt;3</span>
            <DottedLine />
            <div style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
              <span style={{ fontWeight: 800, textDecoration: 'line-through', textDecorationThickness: '1.5px' }}>
                3.600₽
              </span>
              <span style={{ 
                color: '#d32f2f', 
                fontWeight: 800, 
                position: 'absolute', 
                top: '-12px', 
                right: '-10px', 
                transform: 'rotate(-5deg)',
                backgroundColor: '#fff', // Чтобы перекрывать линию под собой
                padding: '0 2px'
              }}>
                1.598₽
              </span>
            </div>
          </div>

          {/* made.with.love */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
            <DottedLine />
            <span style={{ fontWeight: 800, margin: '0 10px' }}>made.with.love</span>
            <DottedLine />
          </div>

          {/* ASCII Кот и Характеристики (Идеальная сетка, шрифт 14px monospace) */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <SpecRow cat="... /\_/\ .. ♡" text="материал" isBold={true} />
            <SpecRow cat="> ( •  • ) <" text="хирургическая сталь" />
            <SpecRow cat="...   |    | \_" text="" />
            <SpecRow cat="...   | |  |  )_" text="доставка" isBold={true} />
            <SpecRow cat="```L--L-- / /````" text="по всему РФ+СНГ" />
            <SpecRow cat="........ \\ " text="" />
            <SpecRow cat="......... V " text="выбери размер" isBold={true} />
          </div>

          {/* Выбор размера (Красный круг точно по макету) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '30px', fontWeight: 800 }}>
            <span style={{ marginRight: '10px' }}>[</span>
            {[16, 17, 18, 19].map((size, index) => {
              const isSelected = selectedSize === size;
              return (
                <span key={size} style={{ display: 'flex', alignItems: 'center' }}>
                  <span 
                    onClick={() => setSelectedSize(size)}
                    style={{ 
                      cursor: 'pointer', 
                      color: isSelected ? '#d32f2f' : '#000',
                      border: isSelected ? '1.5px solid #d32f2f' : '1.5px solid transparent',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      margin: '0 5px',
                      userSelect: 'none'
                    }}
                  >
                    {size}
                  </span>
                  {index < 3 && <span style={{ margin: '0 5px' }}>][</span>}
                </span>
              );
            })}
            <span style={{ marginLeft: '10px' }}>]</span>
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
