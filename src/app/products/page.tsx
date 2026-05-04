'use client';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

// 1. ДАННЫЕ (Можешь добавлять сюда новые товары)
const productsData = [
  {
    id: 'ring-heart',
    title: 'кольцо <3',
    price: '1598₽',
    oldPrice: '3600₽',
    material: 'сплав стали',
    delivery: 'доставка по всему рф+снг',
    href: '/products/ring-heart' // Ссылка на страницу конкретного товара
  }
];

// 2. ГЛАВНАЯ ФУНКЦИЯ СТРАНИЦЫ (которую ты случайно удалил)
export default function ProductsPage() {
  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '1000px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      padding: '40px 20px'
    }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ position: 'relative', zIndex: 100 }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' }
        ]} />
      </div>

      {/* СЕТКА ТОВАРОВ */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', // Адаптивная сетка
        gap: '80px 40px', // Отступы между товарами (80px по вертикали, чтобы не слипались)
        width: '100%',
        marginTop: '20px'
      }}>
        
        {productsData.map((product) => (
          <div key={product.id} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
            {/* КЛИКАБЕЛЬНЫЙ КВАДРАТ ТОВАРА */}
            {/* display: 'block' делает так, чтобы ссылка обернула весь квадрат */}
            <Link 
              href={product.href} 
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              {/* marginBottom: '30px' отодвигает текст вниз от крестиков */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '30px' }}> 
                
                {/* Крестики вынесены наружу на 15px */}
                <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
                
                {/* Сам серый квадрат */}
                <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
              </div>
            </Link>

            {/* ИНФО О ТОВАРЕ */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ fontWeight: 800, fontSize: '20px' }}>{product.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontWeight: 800 }}>
                <span style={{ color: '#d93a3a', fontSize: '16px' }}>{product.price}</span>
                <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '14px' }}>{product.oldPrice}</span>
              </div>
            </div>

            <div style={{ fontWeight: 500, fontSize: '14px', lineHeight: 1.4, marginBottom: '25px' }}>
              <div>{product.material}</div>
              <div>{product.delivery}</div>
            </div>

            {/* КНОПКИ */}
            <div style={{ display: 'flex', gap: '15px', fontWeight: 800, fontSize: '14px' }}>
              <Link href={product.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                [ подробнее ]
              </Link>
              <button style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                fontFamily: 'inherit', 
                fontWeight: 800, 
                fontSize: '14px', 
                cursor: 'pointer',
                color: 'inherit'
              }}>
                [ +в 🛒'у ]
              </button>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
