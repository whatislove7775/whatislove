'use client';
import Link from 'next/link';
// ВАЖНО: Проверь, правильный ли здесь путь до твоего файла Cart.tsx
// Если он лежит в другой папке, поправь путь (например, '../components/Cart')
import Cart from '@/components/Cart'; 

export default function Breadcrumbs({ path }: any) {
  // Автоматически определяем ссылку для возврата
  const backLink = path.length > 1 && path[path.length - 2].href ? path[path.length - 2].href : '/';

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', // flex-start чтобы корзина ровно свисала вниз и не ломала шапку
      width: '100%', 
      fontWeight: 800, 
      fontSize: '14px', 
      marginBottom: '40px',
      position: 'relative', 
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

      {/* ПРАВАЯ ЧАСТЬ: ТВОЯ КОРЗИНА + Домик и Крестик */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px' }}>
        
        {/* ВОТ ОНА: Вызываем твой настоящий компонент корзины */}
        <Cart />

        {/* Домик и Крестик */}
        <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            [ 🏠 ]
          </Link>
          <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>
            [ × ]
          </Link>
        </div>
      </div>
      
    </div>
  );
}
