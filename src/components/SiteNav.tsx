'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function SiteNav({ paths, backLink = '/', closeLink = '/' }: any) {
  const pathname = usePathname();

  // Если мы на главной странице ( / ) — компонент возвращает пустоту и прячется
  if (pathname === '/') return null;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      width: '100%', 
      fontWeight: 800, 
      fontSize: '14px', 
      marginBottom: '40px',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit' }}>
          [{"<"}]
        </Link>
        <Breadcrumbs path={paths} />
      </div>
      
      <Link href={closeLink} style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px' }}>
        [×]
      </Link>
    </div>
  );
}
