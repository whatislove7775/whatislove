'use client';
import { useState, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';

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
        // Если товара нет в базе, можно раскомментировать редирект
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

  const handleAddToCart = () => {
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

  const InfoRow = ({ label, value, isBold = false, isRed = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isBold ? 800 : 500, color: isRed ? '#d32f2f' : '#000', textAlign: 'right' }}>{value}</span>
    </div>
  );

  // Безопасно разбиваем строку доставки (например "доставка по РФ+СНГ")
  const deliveryText = product.delivery || '';
  const deliveryParts = deliveryText.split('+');
  const deliveryMain = deliveryParts[0] || '';
  const deliveryExtra = deliveryParts[1] ? `+${deliveryParts[1]}` : '';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: product.name.toLowerCase(), icon: '💍' }
        ]} />
      </div>

      {/* ОСНОВНОЙ БЛОК ТОВАРА */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        gap: '40px', 
        marginTop: '30px',
        alignItems: 'flex-start',
        paddingRight: '140px',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '20px', flexShrink: 0, width: '450px' }}> 
          
          {/* Главное фото */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              {/* Крестики по углам контейнера */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              
              {/* Прямоугольник фото */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
                {product.image_url && (
                  <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          {/* Миниатюры: Выровнены строго по высоте фото */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            width: '70px',
            alignSelf: 'stretch',
            marginTop: '15px', 
            marginBottom: '35px' 
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px', fontSize: '14px', marginTop: '15px' }}>
          
          <InfoRow label="наименование" value={product.name.toLowerCase()} isBold={true} />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800 }}>цена</span>
            <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
              ..........................................................................................................................................................................................
            </div>
            <div style={{ display: 'flex', gap: '10px', fontWeight: 800 }}>
              {product.oldPrice && (
                <span style={{ color: '#999', textDecoration: 'line-through' }}>{product.oldPrice}</span>
              )}
              <span style={{ color: '#d32f2f' }}>{product.price} руб</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>....................................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>....................................................................................................</div>
          </div>

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <InfoRow label="материал" value={product.material} />

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <InfoRow label="доставка" value={deliveryMain} />
          
          {deliveryExtra && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>............................................................................................................................</div>
              <span style={{ fontWeight: 500, paddingLeft: '8px' }}>{deliveryExtra}</span>
            </div>
          )}

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 800 }}>выбери размер ниже</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>................................................................................</div>
          </div>

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '20px' }}>
            ..........................................................................................................................................................................................
          </div>

          {/* ВЫБОР РАЗМЕРА */}
          <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 800, alignItems: 'center' }}>
            {[16, 17, 18, 19].map((size) => (
              <span 
                key={size} 
                onClick={() => setSelectedSize(size)}
                style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', margin: '0 8px' }}
              >
                {selectedSize === size ? (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#d32f2f', 
                    border: '1.5px solid #d32f2f', 
                    borderRadius: '50%', 
                    width: '26px', 
                    height: '26px' 
                  }}>
                    {size}
                  </span>
                ) : (
                  `[ ${size} ]`
                )}
              </span>
            ))}
          </div>

          {/* НИЖНИЙ БЛОК */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px' }}>
            <div style={{ fontWeight: 500, lineHeight: 1.4, fontSize: '14px' }}>
              произведём, упакуем,<br/>
              и доставим
            </div>
            <button 
              onClick={handleAddToCart}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                fontWeight: 800, 
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: 0,
                fontSize: '14px'
              }}
            >
              [ +добавить в 🛒'y ]
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
