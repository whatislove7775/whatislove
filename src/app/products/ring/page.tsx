'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Пунктирная линия (заполняет пространство)
const DottedLine = () => (
  <div style={{ 
    flex: 1, 
    borderBottom: '1.5px dotted #000', 
    margin: '0 8px', 
    position: 'relative', 
    top: '-4px' 
  }}></div>
);

// Строка характеристик. ls = letterSpacing для подгона кота
const SpecRow = ({ cat, text, isBold = false, ls = '0px' }: { cat: string, text: string, isBold?: boolean, ls?: string }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '4px', lineHeight: 1.2 }}>
    {/* whiteSpace: 'pre' сохраняет твои пробелы, ls меняет межбуквенный интервал */}
    <span style={{ whiteSpace: 'pre', letterSpacing: ls }}>{cat}</span>
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
              {/* Крестики строго по углам через transform */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
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
            <DottedLine />
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
            <DottedLine />
            <span style={{ fontWeight: 800, margin: '0 10px' }}>made.with.love</span>
            <DottedLine />
          </div>

          {/* ASCII Кот и Характеристики */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Тут ты можешь менять пробелы внутри строк и крутить параметр ls (letterSpacing), 
              чтобы линии кота идеально сошлись в твоем шрифте.
            */}
            <SpecRow cat="... /\_/\ .. ♡" text="материал" isBold={true} ls="1px" />
            <SpecRow cat="> ( •  • ) <" text="хирургическая сталь" ls="1.8px" />
            <SpecRow cat="...   |    | \_" text="" ls="1px" />
            <SpecRow cat="...   | |  |  )_" text="доставка" isBold={true} ls="1px" />
            <SpecRow cat="```L--L-- / /````" text="по всему РФ+СНГ" ls="1px" />
            <SpecRow cat="........ \\ " text="" ls="2.5px" />
            <SpecRow cat="......... V " text="выбери размер" isBold={true} ls="2.6px" />
          </div>

          {/* Выбор размера (без лишних скобок, как в макете) */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px', fontWeight: 800 }}>
            {[16, 17, 18, 19].map((size) => {
              const isSelected = selectedSize === size;
              return (
                <span key={size} style={{ display: 'flex', alignItems: 'center' }}>
                  [ 
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
                      margin: '0 4px',
                      userSelect: 'none'
                    }}
                  >
                    {size}
                  </span> 
                  ]
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
