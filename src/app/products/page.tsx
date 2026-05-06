'use client';
import { useEffect, useState } from 'react'; // Проверь этот импорт!
import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state: any) => state.addItem);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <div style={{ padding: '20px', fontWeight: 800 }}>ЗАГРУЗКА...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'inherit' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' }
      ]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '60px', marginTop: '30px' }}>
        {products.map((product) => (
          <div key={product.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
            <Link href={`/products/${product.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ position: 'relative', width: '100%', marginBottom: '30px' }}>
                <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px' }}>+</div>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px' }}>+</div>
                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px' }}>+</div>
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px' }}>+</div>
                <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}>
                   {product.image_url && <img src={product.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} />}
                </div>
              </div>
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
              <div>{product.name.toLowerCase()}</div>
              <div style={{ color: '#d32f2f' }}>{product.price}₽</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
