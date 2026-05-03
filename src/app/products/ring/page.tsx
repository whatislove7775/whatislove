'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

// Цены вынесены в компонент, чтобы код был чище
const ProductPrice = () => (
  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
    <span style={{ 
      color: '#d32f2f', 
      fontWeight: 800, 
      position: 'absolute', 
      top: '-15px', 
      right: '-10px', 
      transform: 'rotate(-5deg)',
      backgroundColor: '#fff',
      padding: '0 2px'
    }}>
      1.598₽
    </span>
    <span style={{ fontWeight: 800 }}>3.600₽</span>
  </div>
);

// Вспомогательный компонент для строки кота
const CatLine = ({ cat, ls = '0px', text = '', isBold = false }: { cat: string, ls?: string, text?: string, isBold?: boolean }) => (
  <div style={{ display: 'flex', width: '100%', marginBottom: '-2px' }}>
    {/* ls - letterSpacing для подгона кота */}
    <span style={{ whiteSpace: 'pre', letterSpacing: ls, fontWeight: 500 }}>{cat}</span>
    <div style={{ flex: 1, position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '6px', left: 0, right: 0, borderBottom: '1.5px dotted #000', opacity: 0.8 }}></div>
    </div>
    <span style={{ fontWeight: isBold ? 800 : 500, paddingLeft: '8px', textAlign: 'right' }}>{text}</span>
  </div>
);

export default function ProductPage() {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: 'ring-1',
      name: 'кольцо <3',
      price: 1598,
      size: 17,
      quantity: 1
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'ИНФО', icon: '❓' }
        ]} />
      </div>

      {/* ОСНОВНОЙ БЛОК ТОВАРА */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        gap: '40px', 
        marginTop: '20px',
        alignItems: 'flex-start',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, width: '450px' }}>
          
          {/* Главное фото */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}>
              {/* Крестики по углам */}
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
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            <ProductPrice />
          </div>

          {/* made.with.love */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000' }}></div>
            <span style={{ fontWeight: 800, margin: '0 10px' }}>made.with.love</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000' }}></div>
          </div>
          {/* ASCII Кот и Характеристики (ТУПО ТЕКСТ И ТОЧКИ) */}
          <div style={{ 
            width: '100%', 
            whiteSpace: 'pre-wrap', 
            lineHeight: '1.4', 
            fontWeight: 500,
            fontSize: '14px'}}>
            <span style={{ letterSpacing: '0px' }}>{`... /\\_/\\ .. ♡`}</span>{`........................................ `}<span style={{ fontWeight: 800 }}>материал</span>{'\n'}
            <span style={{ letterSpacing: '1px' }}>{`> ( •  • ) <`}</span>{`............................. хирургическая сталь`}{'\n'}
            <span style={{ letterSpacing: '1px' }}>{`...   |    | \\_`}</span>{`................................................`}{'\n'}
            <span style={{ letterSpacing: '1px' }}>{`...   | |  |  )_`}</span>{`........................................ `}<span style={{ fontWeight: 800 }}>доставка</span>{'\n'}
            <span style={{ letterSpacing: '0.8px' }}>{`\`\`\`L--L-- / /\`\`\`\``}</span>{`................................. по всему РФ+СНГ`}{'\n'}
            <span style={{ letterSpacing: '2.5px' }}>{`........ \\\\ `}</span>{`....................................................`}{'\n'}
            <span style={{ letterSpacing: '2.6px' }}>{`......... V `}</span>{`....................................... `}<span style={{ fontWeight: 800 }}>выбери размер</span>
          </div>

          {/* Выбор размера [16] (17) [18] [19] */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', fontWeight: 800, alignItems: 'center' }}>
            {[16, 17, 18, 19].map((size) => (
              <span key={size}>
                {selectedSize === size ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f', border: '1.5px solid #d32f2f', borderRadius: '50%', width: '24px', height: '24px', margin: '0 2px' }}>
                    {size}
                  </span>
                ) : (
                  `[${size}]`
                )}
              </span>
            ))}
          </div>

          {/* Нижний блок: Оставляем, как было (фото 1) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            {/* Твой текстовый блок "произведём.... упакуем....... и доставим...." */}
            <div style={{ fontWeight: 500, lineHeight: 1.4, textAlign: 'left' }}>
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
