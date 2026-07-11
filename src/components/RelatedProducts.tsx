import Link from 'next/link';
import SmartImage from '@/components/SmartImage';

interface RelatedProduct { id: number; slug: string; name: string; price: number; image_url: string | null; }

export default function RelatedProducts({ items }: { items: RelatedProduct[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ width: '100%', marginTop: '48px' }}>
      <div style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', color: '#888', marginBottom: '14px', textTransform: 'uppercase' }}>
        похожие товары
      </div>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            style={{ flexShrink: 0, width: '120px', textDecoration: 'none', color: '#000' }}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px', background: '#e5e5e5', overflow: 'hidden' }}>
              {p.image_url && <SmartImage src={p.image_url} alt={p.name} fill sizes="120px" style={{ objectFit: 'cover' }} />}
            </div>
            <div style={{ fontWeight: 800, fontSize: '12px', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name.toLowerCase()}
            </div>
            <div style={{ fontWeight: 800, fontSize: '12px', color: '#d32f2f' }}>{p.price} руб</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
