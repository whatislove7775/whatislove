'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function RingPage() {
  // ВОТ ЭТА СТРОКА ПОТЕРЯЛАСЬ (Стейт для выбранного размера)
  const [selectedSize, setSelectedSize] = useState(17);
  
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: 'ring-1',
      name: 'кольцо <3',
      price: 1598,
      size: selectedSize,
      quantity: 1
    });
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      
      {/* НАВИГАЦИЯ */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'PRODUCT$', href: '/products', icon: '📦' },
          { name: 'КОЛЬЦО <3', icon: '💍' }
        ]} />
      </div>

      {/* ОСНОВНОЙ БЛОК ТОВАРА */}
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        gap: '40px', 
        marginTop: '20px',
        alignItems: 'flex-start',
        paddingRight: '140px', // Отступ справа
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ */}
        <div style={{ display: 'flex', gap: '15px', flexShrink: 0, width: '450px' }}>
          
          {/* Главное фото */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '18px', lineHeight: 1 }}>+</div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 800 }}>&lt;333*</div>
          </div>

          {/* Вертикальные миниатюры */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '70px', flexShrink: 0 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
          
          {/* Заголовок и Цена */}
          <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginBottom: '15px' }}>
            <span style={{ fontWeight: 800 }}>кольцо&lt;3</span>
            <div style={{ flex: 1, borderBottom: '1.5px dotted #000', margin: '0 8px', position: 'relative', top: '-4px' }}></div>
            {/* Цены выровнены одна над другой */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.1 }}>
              <span style={{ color: '#d32f2f', fontWeight: 800 }}>1.598₽</span>
              <span style={{ fontWeight: 800, textDecoration: 'line-through', textDecorationThickness: '1.5px' }}>
                3.600₽
              </span>
            </div>
          </div>

          {/* made.with.love */}
