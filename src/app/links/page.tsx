'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

const links = [
  { name: 'TELEGRAM ЧАНЕЛ', url: 'https://t.me/whatislove_r' },
  { name: 'TELEGRAM ЛИЧКА', url: 'https://t.me/vlad_markov' },
  { name: 'PINTEREST', url: 'https://pinterest.com/' },
  { name: 'BEHANCE', url: 'https://behance.net/' },
  { name: 'GITHUB', url: 'https://github.com/' },
];

export default function LinksPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Breadcrumbs path={[{ name: 'LINK^S', icon: '🔗' }]} />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '15px', 
        width: '100%', 
        maxWidth: '400px', 
        marginTop: '50px' 
      }}>
        {links.map((link, i) => (
          <a 
            key={i} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              border: '1px solid #000', 
              padding: '12px', 
              textAlign: 'center', 
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#000',
              textTransform: 'uppercase'
            }}
          >
            [ {link.name} ]
          </a>
        ))}
      </div>
    </div>
  );
}
