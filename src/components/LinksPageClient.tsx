'use client';
import Breadcrumbs from '@/components/Breadcrumbs';
import Keycap from '@/components/Keycap';
import useFloatingEmoji from '@/components/useFloatingEmoji';
import { telegramHref } from '@/lib/telegram';

interface LinkItem { id: string; label: string; url: string; column_id?: string | null; }
interface ColumnItem { id: string; title: string; sort_order: number; }

const DEFAULT_LINKS: LinkItem[] = [
  { id: 'd1', label: '[КАНАЛ В ТГ]', url: 'https://t.me/whatislove_r' },
  { id: 'd2', label: '[АВТОР В ТГ]', url: 'https://t.me/babydonthurtmovich' },
  { id: 'd3', label: '[ПОЧТА]', url: 'mailto:babydonthurtmovich@mail.ru' },
];

function displayUrl(url: string) {
  return url.replace(/^mailto:/, '').replace(/^https?:\/\//, '');
}

// Добавляем протокол (если в админке забыли) и переписываем t.me → telegram.me в href.
// Внешний ВИД ссылки (displayUrl) при этом остаётся прежним: t.me/...
function hrefUrl(url: string) {
  const withProto = /^(https?:|mailto:|tel:)/.test(url) ? url : `https://${url}`;
  return telegramHref(withProto);
}

function LinkRow({ l }: { l: LinkItem }) {
  return (
    <div className="links-nav-item" style={{ display: 'flex', gap: '10px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>
      <span>{l.label}</span>
      <a href={hrefUrl(l.url)} target={l.url.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer">
        {displayUrl(l.url)}
      </a>
    </div>
  );
}

export default function LinksPageClient({ links, columns = [] }: { links: LinkItem[]; columns?: ColumnItem[] }) {
  const { items, spawn } = useFloatingEmoji();
  const list = links.length > 0 ? links : DEFAULT_LINKS;

  // Колонки показываем только если реально сконфигурированы в админке — иначе всё как раньше, одной строкой.
  const useColumns = columns.length > 0 && links.length > 0;
  const rest = useColumns ? list.filter(l => !l.column_id) : [];

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

        {useColumns ? (
          <div className="links-columns">
            {columns.map(col => {
              const group = list.filter(l => l.column_id === col.id);
              if (group.length === 0) return null;
              return (
                <div key={col.id} className="links-column">
                  {col.title && <div className="links-column-title">{col.title}</div>}
                  {group.map(l => <LinkRow key={l.id} l={l} />)}
                </div>
              );
            })}
            {rest.length > 0 && (
              <div className="links-column">
                {rest.map(l => <LinkRow key={l.id} l={l} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="links-nav" style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
            {list.map(l => <LinkRow key={l.id} l={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
