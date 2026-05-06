'use client';

import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

import Breadcrumbs from '@/components/Breadcrumbs';

import Link from 'next/link';

import { useCartStore } from '@/store/cartStore';



export default function ProductsPage() {

  // 1. Создаем состояние для товаров и загрузки

  const [products, setProducts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  

  const addItem = useCartStore((state: any) => state.addItem);



  // 2. Загружаем данные из базы при открытии страницы

  useEffect(() => {

    async function fetchProducts() {

      const { data, error } = await supabase

        .from('products')

        .select('*');



      if (!error && data) {

        setProducts(data);

      }

      setLoading(false);

    }

    fetchProducts();

  }, []);



  const handleQuickAdd = (e: React.MouseEvent, product: any) => {

    e.preventDefault();

    addItem({

      id: product.id,

      name: product.name,

      price: product.price,

      size: 17, 

      quantity: 1

    });

  };



  // Пока данные грузятся, можно показать пустую сетку или текст

  if (loading) return <div style={{ padding: '20px', fontWeight: 800 }}>ЗАГРУЗКА...</div>;



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

            

            <Link 

              href={`/products/${product.slug}`} 

              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}

            >

              <div style={{ position: 'relative', width: '100%', marginBottom: '30px' }}> 

                

                <div style={{ position: 'absolute', top: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>

                <div style={{ position: 'absolute', top: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>

                <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>

                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>

                

                <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>

                  {/* Если в базе есть ссылка на фото, выводим её, если нет — серый квадрат */}

                  {product.image_url ? (

                    <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                  ) : null}

                </div>

              </div>

            </Link>



            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontWeight: 800 }}>

              <div style={{ fontSize: '18px' }}>{product.name.toLowerCase()}</div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

                <span style={{ color: '#d32f2f' }}>{product.price}₽</span>

                {product.oldPrice && (

                  <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>{product.oldPrice}₽</span>

                )}

              </div>

            </div>

            

            <div style={{ fontSize: '14px', marginTop: '5px', fontWeight: 500 }}>

              {product.material}<br />

              {product.delivery}

            </div>

            

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
