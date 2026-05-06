'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Размер по умолчанию
  const [selectedSize, setSelectedSize] = useState(17);

  const addItem = useCartStore((state: any) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', params.slug)
        .single(); 

      if (error || !data) {
        console.error('Товар не найден');
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

  const commonTextStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'inherit',
    lineHeight: 1.2
  };

  // ЗДЕСЬ БЫЛ ОБРЫВ В ПРОШЛЫЙ РАЗ. ТЕПЕРЬ ТЕГИ ЗАКРЫТЫ.
  if (loading) return <div style={{ padding: '20px', fontWeight: 800, fontSize: '14px' }}>ЗАГРУЗКА...</div>;
  if (!product) return <div style={{ padding: '20px', fontWeight: 800, fontSize: '14px' }}>ТОВАР НЕ НАЙДЕН [404]</div>;

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'inherit' }}>
      
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: product.name.toLowerCase() }
      ]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginTop: '40px' }}>
        
        {/* КАРТИНКА С КРЕСТИКАМИ (ЛЕВАЯ КОЛОНКА) */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
          <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
          
          <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
            {product.image_url && (
              <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
        </div>

        {/* ИНФО (ПРАВАЯ КОЛОНКА) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px' }}>{product.name.toLowerCase()}</div>
          
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#d32f2f', marginBottom: '20px' }}>
            {product.price}₽ 
            {product.oldPrice && (
              <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999', marginLeft: '10px' }}>{product.oldPrice}₽</span>
            )}
          </div>
          
          <div style={{ ...commonTextStyle, marginBottom: '30px' }}>
            материал: {product.material}<br/>
            доставка: {product.delivery}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <div style={{ ...commonTextStyle, fontWeight: 800, marginBottom: '10px' }}>выбери размер ниже</div>
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

          {/* ШИРОКАЯ КНОПКА ДОБАВЛЕНИЯ В КОРЗИНУ */}
          <button 
            onClick={handleAdd}
            style={{ 
              padding: '15px', 
              backgroundColor: '#000', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 800, 
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              width: '100%' 
            }}
          >
            [ +добавить в 🛒'у ]
          </button>
        </div>
      </div>
    </div>
  );
}
