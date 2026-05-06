'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(17);

  const addItem = useCartStore((state: any) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      // Ищем товар в базе по его slug
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .single(); // Нам нужен только один результат

      if (error || !data) {
        console.error('Товар не найден');
        // Если товара нет в базе, можно редиректнуть обратно в каталог
        // router.push('/products'); 
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleAdd = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        quantity: 1
      });
    }
  };

  if (loading) return <div style={{ padding: '20px', fontWeight: 800 }}>ЗАГРУЗКА...</div>;
  if (!product) return <div style={{ padding: '20px', fontWeight: 800 }}>ТОВАР НЕ НАЙДЕН [404]</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'inherit' }}>
      
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: product.name.toLowerCase() }
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '40px' }}>
        {/* БЛОК КАРТИНКИ */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontSize: '20px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontSize: '20px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontSize: '20px', fontWeight: 300 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontSize: '20px', fontWeight: 300 }}>+</div>
          
          <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
            {product.image_url && (
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </div>

        {/* БЛОК ИНФО */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{product.name.toLowerCase()}</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#d32f2f' }}>
            {product.price}₽ 
            {product.oldPrice && (
              <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999', marginLeft: '10px' }}>{product.oldPrice}₽</span>
            )}
          </div>
          
          <div style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
            материал: {product.material}<br/>
            доставка: {product.delivery}
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ fontWeight: 800, marginBottom: '10px', fontSize: '14px' }}>выбери размер ниже</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[16, 17, 18, 19].map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    padding: '5px 10px',
                    border: '1px solid #000',
                    backgroundColor: selectedSize === size ? '#000' : 'transparent',
                    color: selectedSize === size ? '#fff' : '#000',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                >
                  [ {size} ]
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            style={{ 
              marginTop: '30px', 
              padding: '15px', 
              backgroundColor: '#000', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 800, 
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
          >
            [ +добавить в 🛒'у ]
          </button>
        </div>
      </div>
    </div>
  );
}
