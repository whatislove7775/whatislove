'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

const Dots = () => <div style={{ flex: 1, borderBottom: '2px dotted #000', margin: '0 5px 4px 5px' }} />;

export default function RingProductPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Breadcrumbs path={[
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: 'КОЛЬЦО <3', icon: '⚠' }
      ]} />

      <div style={{ display: 'flex', gap: '40px' }}>

        {/* ЛЕВАЯ ЧАСТЬ - Фото + миниатюры */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '350px', height: '350px', border: '1px solid #000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '-5px', fontWeight: 300 }}>+</div>
            <div style={{ position: 'absolute', top: '-10px', right: '-5px', fontWeight: 300 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-10px', left: '-5px', fontWeight: 300 }}>+</div>
            <div style={{ position: 'absolute', bottom: '-10px', right: '-5px', fontWeight: 300 }}>+</div>
            <img src="/product-cat.svg" alt="ring" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '60px', flex: 1, border: '1px solid #000', borderLeft: 'none', borderBottom: i === 4 ? '1px solid #000' : 'none', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ - Описание (Один размер шрифта 14px везде) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '450px' }}>

          <div style={{ display: 'flex', alignItems: 'flex-end', fontWeight: 700 }}>
            <span style={{ textTransform: 'lowercase' }}>кольцо&lt;3</span>
            <Dots />
            <span style={{ color: 'red' }}>1.598₽</span>
          </div>
          <div style={{ textAlign: 'right', fontWeight: 700, textDecoration: 'line-through', textDecorationColor: 'red', marginTop: '2px' }}>
            <span style={{ color: '#000' }}>3.600₽</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, marginTop: '20px' }}>
            <Dots /><span style={{ textTransform: 'lowercase' }}>made.with.love</span><Dots />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
            <img src="/desc-cat.svg" alt="cat" style={{ width: '80px', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', fontWeight: 700 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}><Dots /><span style={{ textTransform: 'lowercase' }}>материал</span></div>
                <div style={{ textAlign: 'right', fontWeight: 400, marginTop: '2px' }}>хирургическая сталь</div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}><Dots /><span style={{ textTransform: 'lowercase' }}>доставка</span></div>
                <div style={{ textAlign: 'right', fontWeight: 400, marginTop: '2px' }}>по всему РФ+СНГ</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', fontWeight: 700, marginTop: '20px' }}>
            <Dots /><span style={{ textTransform: 'lowercase' }}>выбери размер</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', fontWeight: 700 }}>
            {[16, 17, 18, 19].map((size) => (
              <span key={size} onClick={() => setSelectedSize(size)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                [ <span style={{ color: selectedSize === size ? 'red' : '#000', border: selectedSize === size ? '1px solid red' : 'none', borderRadius: '50%', padding: '2px 4px', margin: '0 4px' }}>
                  {size}
                </span> ]
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '40px' }}>
            <div style={{ fontWeight: 400, textTransform: 'lowercase', lineHeight: '1.4' }}>
              произведём....<br/>упакуем.......<br/>и доставим....
            </div>
            <button
              onClick={() => addItem({ id: 'ring-01', name: 'кольцо <3', price: 1598, size: selectedSize, quantity: 1 })}
              style={{ background: 'transparent', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}
            >
              [+добавить в 🛒'y]
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
