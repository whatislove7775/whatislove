'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cartStore';

export default function RingPage() {
  const [selectedSize, setSelectedSize] = useState(17);
  const addItem = useCartStore((state: any) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: 'ring-1',
      name: 'кольцо <3',
      price: 1598,
      size: selectedSize,
      quantity: 1
    });
  };

  // Компонент для строки с идеально ровными текстовыми краями
  const InfoRow = ({ label, value, isBold = false, isRed = false }: any) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
      <span style={{ fontWeight: 800 }}>{label}</span>
      <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
        ..........................................................................................................................................................................................
      </div>
      <span style={{ fontWeight: isBold ? 800 : 500, color: isRed ? '#d32f2f' : '#000', textAlign: 'right' }}>{value}</span>
    </div>
  );

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
        display: 'grid',
        gridTemplateColumns: 'auto 1fr', // Две колонки: фото-блок и инфо-блок
        gap: '60px', 
        marginTop: '30px',
        alignItems: 'flex-start',
        paddingRight: '140px',
        boxSizing: 'border-box'
      }}>
        
        {/* ЛЕВАЯ КОЛОНКА: ГАЛЕРЕЯ (используем GRID для жесткого выравнивания) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', width: '480px' }}>
          
          {/* Главное фото */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Обертка для крестиков (+15px padding) */}
            <div style={{ position: 'relative', width: '100%', padding: '15px', boxSizing: 'border-box' }}>
              {/* Крестики - они НЕ равняются, они торчат наружу */}
              <div style={{ position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', top: 0, right: 0, transform: 'translate(50%, -50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, transform: 'translate(-50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, transform: 'translate(50%, 50%)', fontWeight: 300, fontSize: '20px', lineHeight: 1 }}>+</div>
              
              {/* Сама СЕРАЯ ФОТО-КАРТОЧКА */}
              <div id="main-photo" style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            </div>
            {/* Подпись снизу, НЕ равняется, просто торчит */}
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 800, fontSize: '14px' }}>&lt;333*</div>
          </div>

          {/* МИНИАТЮРЫ - ВЫРАВНИВАЕМ ЖЕСТКО ПО ВЫСОТЕ ФОТО-КАРТОЧКИ */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '80px',
            // Начинаем ровно по верхней границе серого фото (учитываем padding 15px)
            marginTop: '15px', 
            // Заканчиваем ровно по нижней границе серого фото (учитываем aspectRatio)
            height: 'calc(100% - 70px)', // Высота = 100% контейнера минус padding
            justifyContent: 'space-between', // Плотная расстановка миниатюр
          }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5' }}></div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО (Текстовый блок) */}
        {/* Добавляем marginTop: '15px', чтобы текстовый блок начинался ПРЯМО НА УРОВНЕ ВЕРХНЕЙ ГРАНИЦЫ СЕРОГО ФОТО */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '380px', fontSize: '14px', marginTop: '15px' }}>
          
          <InfoRow label="наименование" value="кольцо <3" isBold={true} />
          
          {/* Специальная строка для цены с зачеркиванием */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800 }}>цена</span>
            <div style={{ margin: '0 8px', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, position: 'relative', top: '-1px' }}>
              ..........................................................................................................................................................................................
            </div>
            <div style={{ display: 'flex', gap: '10px', fontWeight: 800 }}>
              <span style={{ color: '#999', textDecoration: 'line-through' }}>3 600</span>
              <span style={{ color: '#d32f2f' }}>1 598 руб</span>
            </div>
          </div>

          {/* сделано с любовью */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>....................................................................................................</div>
            <span style={{ margin: '0 10px', fontWeight: 500 }}>сделано с любовью</span>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>....................................................................................................</div>
          </div>

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <InfoRow label="материал" value="ювелирная сталь" />

          <div style={{ width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8, marginBottom: '4px' }}>
            ..........................................................................................................................................................................................
          </div>

          <InfoRow label="доставка" value="по всей России" />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'flex-end', width: '100%', marginBottom: '4px' }}>
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', opacity: 0.8 }}>............................................................................................................................</div>
            <span style={{ fontWeight: 500, paddingLeft: '8px' }}>+страны СНГ</span>
          </div>

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
