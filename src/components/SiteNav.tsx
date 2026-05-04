'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function SiteNav({ paths, backLink = '/', closeLink = '/' }: any) {
  const pathname = usePathname();

  // Прячем навигацию на главной странице
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link href={backLink} style={{ textDecoration: 'none', color: 'inherit', whiteSpace: 'nowrap' }}>
          [ {'<'} ]
        </Link>
        <Breadcrumbs path={paths} />
      </div>
      
      <Link href={closeLink} style={{ textDecoration: 'none', color: 'inherit', fontSize: '16px', whiteSpace: 'nowrap' }}>
        [ × ]
      </Link>
    </div>
  );
}
