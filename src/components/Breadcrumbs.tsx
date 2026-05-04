'use client';
import Link from 'next/link';
// Путь до компонента корзины. Поправь, если он другой
import Cart from '@/components/Cart'; 

export default function Breadcrumbs({ path }: any) {
  const backLink = path.length > 1 && path[path.length - 2].href ? path[path.length - 2].href : '/';

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', // ВОЗВРАЩАЕМ ВЫРАВНИВАНИЕ ПО ЦЕНТРУ (тонкая шапка)
      width: '100%', 
      fontWeight: 800, 
      fontSize: '14px', 
      marginBottom: '40px',
      position: 'relative', // Для позиционирования корзины относительно шапки
      zIndex: 100           
    }}>
      
      {/* ЛЕВАЯ ЧАСТЬ: Назад и Путь */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}>
          [{"<"}]
        </Link>
        <span style={{ whiteSpace: 'nowrap' }}>
          {path.map((item: any, index: number) => (
            <span key={index}>
              {item.href ? (
                <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {item.icon && `${item.icon} `}{item.name}
                </Link>
              ) : (
                <span>{item.icon && `${item.icon} `}{item.name}</span>
              )}
              {index < path.length - 1 && ' / '}
            </span>
          ))}
        </span>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: Группа управления */}
      {/* gap: '15px' — отступ между группой домик/корзина и крестиком (если он был бы) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative' }}>
        
        {/* КОРЗИНЫ В ЛИНИИ НАВИГАЦИИ НЕТ. НАХУЙ УБРАЛ. */}

        {/* Группа кнопок Домик + Крестик */}
        <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap', alignItems: 'center' }}>
          
          {/* Контейнер ДОМИКА (к нему мы привяжем выравнивание корзины) */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              [ 🏠 ]
            </Link>

            {/* МАГИЯ ЗДЕСЬ: Огромная корзина (с куаркодом) свисает вниз */}
            <div style={{ 
              position: 'absolute', 
              top: 'calc(100% + 20px)', // Свисает на 20px ниже шапки
              left: 0,                 // Идеально выравнивается по левому краю [🏠]
              zIndex: 1000
            }}>
              <Cart />
            </div>
          </div>

          {/* Крестик закрытия */}
          <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>
            [ × ]
          </Link>
        </div>
      </div>
      
    </div>
  );
}
