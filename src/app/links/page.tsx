'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

const links = [
  { name: 'TELEGRAM ЧАНЕЛ', url: 'https://t.me/whatislove_r' },
  { name: 'TELEGRAM ЛИЧКА', url: 'https://t.me/vlad_markov' },
  { name: 'PINTEREST', url: 'https://pinterest.com/...' },
  { name: 'BEHANCE', url: 'https://behance.net/...' },
  { name: 'GITHUB', url: 'https://github.com/...' },
];

export default function LinksPage() {
  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
      <Breadcrumbs path={[{ name: 'LINK^S', icon: '🔗' }]} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
        {links.map((link, i) => (
          <a 
            key={i} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              border: '1px solid #000', 
              padding: '15px', 
              textDecoration: 'none', 
              color: '#000', 
              fontWeight: 'bold',
              textAlign: 'center',
              display: 'block'
            }}
          >
            [ {link.name} ]
          </a>
        ))}
      </div>
    </div>
  );
}
