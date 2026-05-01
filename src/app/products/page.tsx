'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function RingProductPage() {
  const [selectedSize, setSelectedSize] = useState<number>(17);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ id: 'ring-01', name: 'кольцо <3', price: 1598, size: selectedSize, quantity: 1 });
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
      
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'PRODUCT$', href: '/products', icon: '📦' },
        { name: '에고 크리드,안녕하세요', icon: '💍' },
        { name: 'КОЛЬЦО <3', icon: '⚠' }
      ]} />

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px', fontFamily: "'Courier New', Courier, monospace" }}>
        
        {/* Огромное фото строго по макету */}
        <div style={{ width: '100%', border: '1px solid #000', position: 'relative', padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxSizing: 'border-box' }}>
          {/* Маленькие крестики по углам */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '14px', fontWeight: 'bold' }}>+http://googleusercontent.com/image_generation_content/0
