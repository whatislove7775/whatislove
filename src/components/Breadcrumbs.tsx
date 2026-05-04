'use client';
import Link from 'next/link';

export default function Breadcrumbs({ path }: any) {
  // Автоматически определяем ссылку для возврата (предпоследний элемент)
  const backLink = path.length > 1 && path[path.length - 2].href ? path[path.length - 2].href : '/';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', fontWeight: 800, fontSize: '14px', marginBottom: '40px' }}>
      
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

      {/* ПРАВАЯ ЧАСТЬ: Домик и Крестик */}
      <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit', marginRight: '8px' }}>
          [ 🏠 ]
        </Link>
        <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit' }}>
          [ × ]
        </Link>
      </div>
      
    </div>
  );
}
