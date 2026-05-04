'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

const products = [
  { 
    id: 'ring-1', 
    name: 'КОЛЬЦО <3', 
    price: 1598, 
    oldPrice: 3600, 
    slug: 'ring',
    material: 'сплав стали',
    delivery: 'доставка по всему рф+снг'
  }
];

export default function ProductsPage() {
  const addItem = useCartStore((state: any) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); // Чтобы не переходить на страницу товара при клике на кнопку
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size: 17, // Размер по умолчанию для быстрой покупки
      quantity: 1
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'inherit' }}>
      
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' }
      ]} />

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '60px', 
        marginTop: '30px' 
      }}>
        {products.map((product) => (
          <div key={product.id} style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px' }}>
            
            <div style={{ position: 'relative', width: '100%' }}>
              {/* Плюсики отклеены от квадрата (вынесены на 15px наружу) */}
              <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              
              {/* Сам квадрат товара */}
              <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}>
                {/* Тут будет <Image /> или img */}
              </div>
            </div>

            {/* Инфо и Кнопка */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 800 }}>
              <div style={{ fontSize: '18px' }}>{product.name.toLowerCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ color: '#d32f2f' }}>{product.price}₽</span>
                <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>{product.oldPrice}₽</span>
              </div>
            </div>
            
            <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 500 }}>
              {product.material}<br />
              {product.delivery}
            </div>
            
            {/* КНОПКА ДОБАВЛЕНИЯ В КОРЗИНУ */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 800 }}>
                [ подробнее ]
              </Link>
              <button 
                onClick={(e) => handleQuickAdd(e, product)}
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
                [ +в 🛒'у ]
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
