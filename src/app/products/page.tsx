'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

const products = [
  { id: 'ring-1', name: 'КОЛЬЦО <3', price: 1598, oldPrice: 3600, slug: 'ring' }
];

export default function ProductsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'inherit' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' }
      ]} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '40px', 
        marginTop: '30px' 
      }}>
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
              {/* Фото с крестиками */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', marginBottom: '15px' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300 }}>+</div>
                <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300 }}>+</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300 }}>+</div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300 }}>+</div>
              </div>

              {/* Инфо */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 800 }}>
                <div style={{ fontSize: '18px' }}>{product.name.toLowerCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: '#d32f2f' }}>{product.price}₽</span>
                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>{product.oldPrice}₽</span>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 500 }}>
                сплав стали<br />
                доставка по всему рф+снг
              </div>
              
              <div style={{ marginTop: '15px', fontWeight: 800 }}>[ +подробнее ]</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
