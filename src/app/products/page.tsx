'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: 'ring-01',
      name: 'кольцо <3',
      price: 1598,
      size: selectedSize,
      quantity: 1,
    });
  };

  return (
{/* Верхняя панель "Путь вкладки" - Полностью кликабельная */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', width: '100%', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#000', textDecoration: 'none' }}>[&lt;]</Link>
          <Link href="/" style={{ color: '#000', textDecoration: 'none' }}>📁 WH4T!SLOV3</Link>
          <span>/</span>
          <Link href="/products" style={{ color: '#000', textDecoration: 'none' }}>📦 PRODUCT$</Link>
          <span>/</span>
          <Link href="/products" style={{ color: '#000', textDecoration: 'none' }}>💍 에고 크리드,안녕하세요</Link>
          <span>/</span>
          <span>⚠ КОЛЬЦО &lt;3</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/" style={{ color: '#000', textDecoration: 'none' }}>[ 🏠 ]</Link>
          <Link href="/" style={{ color: '#000', textDecoration: 'none' }}>[x]</Link>
        </div>
      </div>

      {/* Основной блок товара */}
      <div style={{ display: 'flex', gap: '60px', marginTop: '20px', flexWrap: 'wrap' }}>
        
        {/* Левая часть: Фотография с крестиками */}
        <div style={{ flex: '1', minWidth: '300px', position: 'relative' }}>
          {/* Крестики по углам */}
          <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontSize: '24px', fontWeight: '300' }}>+</div>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '24px', fontWeight: '300' }}>+</div>
          <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontSize: '24px', fontWeight: '300' }}>+</div>
          <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontSize: '24px', fontWeight: '300' }}>+</div>
          
          {/* Само фото (пока серый квадрат для имитации, позже вставим реальную ссылку на картинку) */}
          <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '40px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
              3&lt;
            </span>
          </div>
        </div>

        {/* Правая часть: Описание и покупка */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px' }}>кольцо&lt;3...................................</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1' }}>
              <span style={{ color: 'red', fontWeight: 'bold', fontSize: '18px', zIndex: 1 }}>1.598₽</span>
              <span style={{ textDecoration: 'line-through', fontSize: '14px', position: 'relative', top: '-5px' }}>3.600₽</span>
            </div>
          </div>

          <pre className="ascii-art" style={{ fontSize: '14px', lineHeight: '1.2', margin: '15px 0' }}>
{`.......................made.with.love.......................
... /\\__/\\ .. ♡........................................материал
> ( •  • ) <.....................хирургическая сталь
... |      |....................................................
... |      | )_........................................ доставка
¨¨ L--L-- / /¨¨......................по всему РФ+СНГ
................ \\ \\ ...............................................
.................. \\/ ............................выбери размер`}
          </pre>

          {/* Выбор размера с логикой круглых скобок для активного */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '18px', fontWeight: 'bold', marginTop: '10px' }}>
            {[16, 17, 18, 19].map((size) => (
              <span 
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{ cursor: 'pointer', color: selectedSize === size ? 'red' : 'black' }}
              >
                [ {selectedSize === size ? `(${size})` : size} ]
              </span>
            ))}
          </div>

          {/* Кнопка добавления в корзину */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px' }}>
            <div style={{ fontSize: '14px', lineHeight: '1.2' }}>
              произведём....<br/>
              упакуем..........<br/>
              и доставим.....
            </div>
            <button 
              onClick={handleAddToCart}
              style={{ fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px' }}
            >
              [ +добавить в 🛒'y ]
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
