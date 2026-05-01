'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

const links = [
  { label: 'КАНАЛ В ТГ', value: 't.me/whatislove_r', url: 'https://t.me/whatislove_r' },
  { label: 'АВТОР В ТГ', value: 't.me/babydonthurtmovich', url: 'https://t.me/babydonthurtmovich' },
  { label: 'ПОЧТА', value: 'babydonthurtmovich@mail.ru', url: 'mailto:babydonthurtmovich@mail.ru' },
];

export default function LinksPage() {
  return (
    <div style={{ width: '100%', maxWidth: '1200px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Breadcrumbs path={[{ name: 'LINK^S', icon: '🔗' }]} />
      
      {/* Место под твой SVG @me */}
      <div style={{ marginTop: '60px', marginBottom: '60px' }}>
         {/* Сюда вставим <img> с твоим SVG в следующем шаге */}
         <div style={{ fontSize: '40px', fontWeight: 700 }}>@me</div> 
      </div>

      {/* Кнопки в одну линию (как на фото 2) */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        gap: '40px', 
        width: '100%',
        fontWeight: 700, // Bold
        fontSize: '14px'
      }}>
        {links.map((link, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ textTransform: 'uppercase' }}>[{link.label}]</span>
            <a 
              href={link.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ borderBottom: '1px solid transparent' }}
            >
              {link.value}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
