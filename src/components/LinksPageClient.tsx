'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Keycap from '@/components/Keycap';
import useFloatingEmoji from '@/components/useFloatingEmoji';

interface LinkItem { id: string; label: string; url: string; }

const DEFAULT_LINKS: LinkItem[] = [
  { id: 'd1', label: '[КАНАЛ В ТГ]', url: 'https://t.me/whatislove_r' },
  { id: 'd2', label: '[АВТОР В ТГ]', url: 'https://t.me/babydonthurtmovich' },
  { id: 'd3', label: '[ПОЧТА]', url: 'mailto:babydonthurtmovich@mail.ru' },
];

function displayUrl(url: string) {
  return url.replace(/^mailto:/, '').replace(/^https?:\/\//, '');
}

// Если в админке забыли указать протокол — ссылка не должна ломаться и вести на /url-как-относительный-путь
function hrefUrl(url: string) {
  return /^(https?:|mailto:|tel:)/.test(url) ? url : `https://${url}`;
}

export default function LinksPageClient({ links }: { links: LinkItem[] }) {
  const { items, spawn } = useFloatingEmoji();
  const list = links.length > 0 ? links : DEFAULT_LINKS;

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'ССЫЛКИ', icon: '🔗' }
        ]} />
      </div>

      <div className="links-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '-60px' }}>

        <div style={{ marginBottom: '60px', position: 'relative', ['--s' as any]: 0.74 }}>
          {items.map(({ id, x }) => (
            <span key={id} className="floating-emoji" style={{ '--hx': `${x}px` } as React.CSSProperties}>🫶🏻</span>
          ))}
          <Keycap id="atme" tw={172} th={112} onClick={spawn}
                  img={{ src: '/keys/atme_src.png', ar: 1268 / 522, h: 63 }} />
        </div>

        <div className="links-nav" style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', flexWrap: 'wrap' }}>
          {list.map((l) => (
            <div key={l.id} className="links-nav-item" style={{ display: 'flex', gap: '10px' }}>
              <span>{l.label}</span>
              <a href={hrefUrl(l.url)} target={l.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
                {displayUrl(l.url)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
