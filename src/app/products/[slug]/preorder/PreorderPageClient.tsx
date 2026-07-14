'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import SmartImage from '@/components/SmartImage';

const BOT_LINK = 'https://telegram.me/wh4tislove_orders_bot';

export default function PreorderPageClient({ product, sizes }: {
  product: { id: number; name: string; slug: string; price: number; image_url: string | null };
  sizes: string[];
}) {
  const router = useRouter();
  const [size, setSize] = useState(sizes[0] ?? '');
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — реальные пользователи это поле не видят и не заполняют
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async () => {
    setError('');
    if (!name.trim()) { setError('укажите имя'); return; }
    if (!telegram.trim()) { setError('укажите телеграм'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          size,
          name: name.trim(),
          telegram: telegram.trim().replace(/^@/, ''),
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ошибка');
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, fontFamily: 'inherit' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'МАГАЗИН', href: '/products', icon: '📦' },
        { name: product.name.toLowerCase(), href: `/products/${product.slug}`, icon: '💍' },
        { name: 'ПРЕДЗАКАЗ', icon: '🔔' },
      ]} />

      <div style={{ width: '100%', maxWidth: '460px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Шапка товара */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {product.image_url && (
            <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0, background: '#e5e5e5', overflow: 'hidden' }}>
              <SmartImage src={product.image_url} alt={product.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: 800, fontSize: '17px' }}>{product.name.toLowerCase()}</div>
            <div style={{ fontWeight: 800, color: '#d32f2f' }}>{product.price} руб</div>
          </div>
        </div>

        {done ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '2px dotted rgba(0,0,0,0.2)', paddingTop: '22px' }}>
            <div style={{ fontWeight: 800, fontSize: '16px' }}>предзаказ принят ✓</div>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
              когда товар поступит в наличие — мы пришлём уведомление.<br />
              чтобы получить его прямо в Telegram, напишите <b>/start</b> нашему{' '}
              <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" className="link-underline" style={{ fontWeight: 800 }}>боту</a>.
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
              <Link href={`/products/${product.slug}`} style={{ fontWeight: 800, fontSize: '14px' }}>[ к товару ]</Link>
              <Link href="/products" style={{ fontWeight: 800, fontSize: '14px' }}>[ к каталогу ]</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '2px dotted rgba(0,0,0,0.2)', paddingTop: '22px' }}>
            {/* Honeypot: скрыто от людей стилями, боты часто заполняют все поля вслепую */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
              aria-hidden="true"
            />
            <div style={{ fontSize: '14px', lineHeight: 1.5, color: '#555' }}>
              оплачивать ничего не нужно — оставьте предзаказ, и мы напишем вам, как только товар появится.
            </div>

            {sizes.length > 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#888', fontWeight: 800 }}>размер</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {sizes.map(s => (
                    <span
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        cursor: 'pointer', fontWeight: 800, fontSize: '14px',
                        padding: '5px 12px',
                        border: size === s ? '1.5px solid #d32f2f' : '1px solid #ccc',
                        color: size === s ? '#d32f2f' : '#000',
                      }}
                    >{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 800 }}>ваше имя</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={inp} placeholder="как к вам обращаться" autoFocus />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#888', fontWeight: 800 }}>telegram</label>
              <input value={telegram} onChange={e => setTelegram(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={inp} placeholder="@username" />
            </div>

            {error && <div style={{ fontSize: '13px', color: '#c00', fontWeight: 700 }}>{error}</div>}

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '4px' }}>
              <button
                onClick={submit}
                disabled={submitting}
                style={{ fontWeight: 800, fontFamily: 'inherit', fontSize: '14px', background: '#000', color: '#fff', border: 'none', padding: '12px 22px', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'оформляем...' : 'оформить предзаказ'}
              </button>
              <Link href={`/products/${product.slug}`} style={{ fontWeight: 800, fontSize: '14px', color: '#888' }}>отмена</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '10px 12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' };
