'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export default function ProductsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Breadcrumbs path={[{ name: 'PRODUCT$', icon: '📦' }]} />

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* Товар 1: Кольцо */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <Link href="/products/ring" style={{ textDecoration: 'none', color: '#000' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', border: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
              <div style={{ position: 'absolute', top: '-7px', left: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', top: '-7px', right: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-7px', left: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-7px', right: '-4px', fontWeight: 300 }}>+</div>
              <img src="/product-cat.svg" alt="ring" style={{ width: '60%', height: '60%', objectFit: 'contain' }} />
            </div>
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, textTransform: 'lowercase' }}>
            <span>кольцо &lt;3</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'red' }}>1.598₽</span><br/>
              <span style={{ textDecoration: 'line-through', textDecorationColor: 'red' }}>3.600₽</span>
            </div>
          </div>

          <div style={{ marginTop: '10px', textTransform: 'lowercase', lineHeight: '1.4' }}>
            хирургическая сталь<br/>
            доставка по всему РФ+СНГ<br/>
            размеры 16-19
          </div>

          <Link href="/products/ring" style={{ marginTop: '15px', fontWeight: 700, textTransform: 'lowercase', textDecoration: 'none', color: '#000' }}>
            [ открыть карточку ]
          </Link>
        </div>

        {/* Товар 2: Рамочки */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', border: 'none', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
              <div style={{ position: 'absolute', top: '-7px', left: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', top: '-7px', right: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-7px', left: '-4px', fontWeight: 300 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-7px', right: '-4px', fontWeight: 300 }}>+</div>
              <span style={{ fontWeight: 700 }}>РАМКИ</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, textTransform: 'lowercase' }}>
            <span>рам[о]чки</span>
            <span style={{ textAlign: 'right' }}>3.499₽</span>
          </div>

          <div style={{ marginTop: '10px', textTransform: 'lowercase', lineHeight: '1.4' }}>
            сплав стали<br/>
            доставка по всему РФ+СНГ
          </div>

          <div style={{ marginTop: '15px', fontWeight: 700, textTransform: 'lowercase', cursor: 'pointer' }}>
            [ +добавить в 🛒'y ]
          </div>
        </div>

      </div>
    </div>
  );
}
