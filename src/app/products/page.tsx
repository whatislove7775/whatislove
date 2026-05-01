'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export default function AllProductsPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Breadcrumbs path={[{ name: 'PRODUCT$', icon: '📦' }]} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px', width: '100%', marginTop: '20px' }}>
        
        {/* Карточка Кольца */}
        <Link href="/products/ring">
          <div style={{ border: '1px solid #000', padding: '15px', position: 'relative', cursor: 'pointer' }}>
            {/* Крестики по углам */}
            <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '12px' }}>+</div>
            <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '12px' }}>+</div>
            <div style={{ position: 'absolute', bottom: '5px', left: '5px', fontSize: '12px' }}>+</div>
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', fontSize: '12px' }}>+</div>
            
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
               <img src="/product-cat.svg" alt="ring" style={{ width: '80%', height: 'auto' }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 700, textTransform: 'uppercase', fontSize: '14px' }}>
              <div>
                кольцо &lt;3<br/>
                <span style={{ fontSize: '10px', fontWeight: 500 }}>хирургическая сталь</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'red' }}>1.598₽</span><br/>
                <span style={{ textDecoration: 'line-through', fontSize: '10px', color: '#999' }}>3.600₽</span>
              </div>
            </div>
            <div style={{ marginTop: '15px', fontSize: '12px', fontWeight: 700 }}>[ +добавить в 🛒 ]</div>
          </div>
        </Link>

      </div>
    </div>
  );
}
