'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function ProductsPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17); // Размер по умолчанию
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: 'ring-01',
      name: 'кольцо<3',
      price: 1598,
      size: selectedSize,
      quantity: 1,
    });
  };

  return (
    <div style={{ display: 'flex', gap: '40px', maxWidth: '1000px', width: '100%', padding: '40px' }}>
      
      {/* Левая часть - фото (пока заглушка в стиле брутализма) */}
      <div style={{ flex: 1, border: '1px solid #000', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        [ фото кольца ]
      </div>

      {/* Правая часть - информация и ASCII */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
          <span>кольцо&lt;3</span>
          <span style={{ color: 'red', textDecoration: 'line-through', fontSize: '14px' }}>3.600₽</span>
          <span>1.598₽</span>
        </div>

        <pre className="ascii-art" style={{ fontSize: '12px', lineHeight: '1.2', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '15px 0' }}>
{`.......................made.with.love.......................
... /\\__/\\ .. ♡........................................материал
> ( •  • ) <.....................хирургическая сталь
... |      |....................................................
... |      | )_........................................ доставка
¨¨ L--L-- / /¨¨......................по всему РФ+СНГ
................ \\ \\ ...............................................
.................. \\/ ............................выбери размер`}
        </pre>

        {/* Выбор размера */}
        <div style={{ display: 'flex', gap: '10px', fontSize: '16px' }}>
          {[16, 17, 18, 19].map((size) => (
            <span 
              key={size}
              onClick={() => setSelectedSize(size)}
              style={{ 
                cursor: 'pointer', 
                border: selectedSize === size ? '1px solid red' : 'none',
                color: selectedSize === size ? 'red' : 'black',
                padding: '2px 5px'
              }}
            >
              [ {size} ]
            </span>
          ))}
        </div>

        {/* Кнопка добавления в корзину */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
            произведём....<br/>
            упакуем..........<br/>
            и доставим.....
          </div>
          <button 
            onClick={handleAddToCart}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'inherit',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            [ +добавить в 🛒 ]
          </button>
        </div>
      </div>

    </div>
  );
}
