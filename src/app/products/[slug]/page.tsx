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
  
  // Устанавливаем размер по умолчанию "17", как на макете
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

  // Базовый кегль 14px для всего текста
  const commonTextStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'inherit',
    lineHeight: 1.2
  };

  if (loading) return <div style={{ padding: '20px', fontWeight: 800, fontSize: '14px' }}>ЗАГРУЗКА...
