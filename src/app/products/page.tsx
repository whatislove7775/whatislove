'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export default function AllProductsPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
      <Breadcrumbs path={[{ name: 'PRODUCT$', icon: '📦' }]} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
        {/* Карточка товара */}
        <Link href="/products/ring" style={{ textDecoration: 'none', color: '#000' }}>
          <div style={{ border: '1px solid #000', padding: '10px', position: 'relative' }}>
            <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px' }}>
              3&lt;
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>КОЛЬЦО &lt;3</span>
              <span style={{ color: 'red' }}>1.598₽</span>
            </div>
          </div>
        </Link>
        {/* Повторить для других товаров */}
      </div>
    </div>
  );
}
