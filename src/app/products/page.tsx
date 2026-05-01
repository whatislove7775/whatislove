'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function ProductsPage() {
  const [view, setView] = useState<'list' | 'ring'>('list');
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id: 'ring-01', name: 'кольцо <3', price: 1598, size: selectedSize, quantity: 1 });
  };

  if (view === 'list') {
    return (
      <div style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Breadcrumbs path={[{ name: 'PRODUCT$', icon: '📦' }]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px', width: '100%', marginTop: '20px' }}>
          <div onClick={() => setView('ring')} style={{ border: '1px solid #000', padding: '15px', position: 'relative', cursor: 'pointer' }}>
            <div style={{ position: 'absolute', top: '5px', left: '5px' }}>+</div>
            <div style={{ position: 'absolute', top: '5px', right: '5px' }}>+</div>
            <div style={{ position: 'absolute', bottom: '5px', left: '5px' }}>+</div>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>+</div>
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
               <img src="/product-cat.svg" alt="ring" style={{ width: '80%', height: 'auto' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
              <div>кольцо &lt;3<br/><span style={{ fontSize: '10px', fontWeight: 500 }}>хирургическая сталь</span></div>
              <div style={{ textAlign: 'right' }}><span style={{ color: 'red' }}>1.598₽</span><br/><span style={{ textDecoration: 'line-through', fontSize: '10px', color: '#999' }}>3.600₽</span></div>
            </div>
            <div style={{ marginTop: '15px', fontSize: '12px', fontWeight: 700 }}>[ открыть карточку ]</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Breadcrumbs path={[
        { name: 'PRODUCT$', href: '#', icon: '📦' },
        { name: '에고 크리드,안녕하세요', icon: '💍' },
        { name: 'КОЛЬЦО <3', icon: '⚠' }
      ]} />
      <div style={{ display: 'flex', gap: '60px', marginTop: '20px', flexWrap: 'wrap', width: '100%', justifyContent: 'center' }}>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '500px', position: 'relative', border: '1px solid #000', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>+</div>
          <div style={{ position: 'absolute', top: '10px', right: '10px' }}>+</div>
          <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>+</div>
          <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>+</div>
          <img src="/product-cat.svg" alt="product" style={{ width: '100%', height: 'auto' }} />
        </div>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>кольцо &lt;3</h1>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'red', fontWeight: 700, fontSize: '24px' }}>1.598₽</div>
              <div style={{ textDecoration: 'line-through', fontSize: '14px', color: '#999' }}>3.600₽</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '30px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '2px' }}>MADE.WITH.LOVE</span>
            <img src="/desc-cat.svg" alt="cat" style={{ width: '100px' }} />
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}><span>МАТЕРИАЛ</span><span>ХИРУРГИЧЕСКАЯ СТАЛЬ</span></div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}><span>ДОСТАВКА</span><span>ПО ВСЕМУ РФ+СНГ</span></div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: '15px', fontSize: '12px' }}>ВЫБЕРИ РАЗМЕР</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {[16, 17, 18, 19].map(size => (
                <button key={size} onClick={() => setSelectedSize(size)} style={{ fontWeight: 700, fontSize: '18px', color: selectedSize === size ? 'red' : '#000', background: 'none', border: 'none', cursor: 'pointer' }}>
                  [ {selectedSize === size ? `(${size})` : size} ]
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleAddToCart} style={{ width: '100%', border: '1px solid #000', padding: '15px', fontWeight: 700, fontSize: '16px', marginTop: '20px', background: 'white', cursor: 'pointer' }}>
            [ +ДОБАВИТЬ В 🛒'Y ]
          </button>
          <button onClick={() => setView('list')} style={{ fontSize: '12px', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', marginTop: '10px' }}>
            [ назад к списку ]
          </button>
        </div>
      </div>
    </div>
  );
}
