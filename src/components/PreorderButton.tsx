'use client';
import { useState } from 'react';

const BOT_LINK = 'https://t.me/wh4tislove_orders_bot';

export default function PreorderButton({ product, sizes, initialSize, className }: {
  product: { id: number; name: string; slug: string };
  sizes: string[];
  initialSize?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState(initialSize ?? sizes[0] ?? '');
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
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

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={className}
        style={{ background: 'transparent', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', padding: 0, fontSize: '14px' }}
      >
        [ предзаказать ]
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1.5px solid #000', padding: '16px', marginTop: '8px' }}>
      {done ? (
        <>
          <div style={{ fontWeight: 800 }}>предзаказ принят ✓</div>
          <div style={{ fontSize: '13px', lineHeight: 1.6 }}>
            когда товар поступит — пришлём уведомление.<br />
            чтобы получить его в Telegram, напишите <b>/start</b> нашему{' '}
            <a href={BOT_LINK} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 800 }}>боту</a>.
          </div>
          <button onClick={() => setOpen(false)} style={ghostBtn}>[ закрыть ]</button>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 800, fontSize: '13px' }}>
            предзаказ: {product.name.toLowerCase()}
          </div>

          {sizes.length > 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: '#888' }}>размер</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {sizes.map(s => (
                  <span
                    key={s}
                    onClick={() => setSize(s)}
                    style={{
                      cursor: 'pointer', fontWeight: 800, fontSize: '13px',
                      padding: '3px 9px',
                      border: size === s ? '1.5px solid #d32f2f' : '1px solid #ccc',
                      color: size === s ? '#d32f2f' : '#000',
                    }}
                  >{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', color: '#888' }}>ваше имя</label>
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={inp} placeholder="как к вам обращаться" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', color: '#888' }}>telegram</label>
            <input value={telegram} onChange={e => setTelegram(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} style={inp} placeholder="@username" />
          </div>

          {error && <div style={{ fontSize: '12px', color: '#c00', fontWeight: 700 }}>{error}</div>}

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              onClick={submit}
              disabled={submitting}
              style={{ fontWeight: 800, fontFamily: 'inherit', fontSize: '13px', background: '#000', color: '#fff', border: 'none', padding: '10px 18px', cursor: submitting ? 'default' : 'pointer', opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? '...' : 'оформить предзаказ'}
            </button>
            <button onClick={() => setOpen(false)} style={ghostBtn}>отмена</button>
          </div>
        </>
      )}
    </div>
  );
}

const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const ghostBtn: React.CSSProperties = { fontWeight: 800, fontFamily: 'inherit', border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#888', padding: 0 };
