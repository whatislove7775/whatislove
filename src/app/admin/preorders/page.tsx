'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

export default function PreordersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifying, setNotifying] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'notified'>('pending');

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/preorders', { headers: ah() })
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const notify = async (productId: number) => {
    setNotifying(productId);
    await adminFetch('/api/admin/preorders/notify', { method: 'POST', headers: ah(), body: JSON.stringify({ product_id: productId }) });
    setNotifying(null);
    load();
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  const filtered = items.filter(i => {
    if (filter === 'pending') return !i.notified_at;
    if (filter === 'notified') return !!i.notified_at;
    return true;
  });

  // Группируем по товару
  const groups = new Map<number, { name: string; slug: string; rows: any[] }>();
  for (const i of filtered) {
    if (!groups.has(i.product_id)) {
      groups.set(i.product_id, { name: i.product_name ?? `#${i.product_id}`, slug: i.product_slug ?? '', rows: [] });
    }
    groups.get(i.product_id)!.rows.push(i);
  }

  const pendingTotal = items.filter(i => !i.notified_at).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 800, fontSize: '18px' }}>
          предзаказы ({items.length})
          {pendingTotal > 0 && <span style={{ color: '#c00', fontSize: '13px', marginLeft: '8px' }}>{pendingTotal} ожидают</span>}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
          {(['pending', 'all', 'notified'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '12px', padding: '5px 10px', border: '1.5px solid #000', background: filter === f ? '#000' : '#fff', color: filter === f ? '#fff' : '#000', cursor: 'pointer' }}>
              {f === 'pending' ? 'ожидают' : f === 'notified' ? 'уведомлены' : 'все'}
            </button>
          ))}
        </div>
      </div>

      {groups.size === 0 && <div style={{ color: '#888' }}>предзаказов нет</div>}

      {Array.from(groups.entries()).map(([productId, { name, slug, rows }]) => {
        const pendingRows = rows.filter((r: any) => !r.notified_at);
        return (
          <div key={productId} style={{ border: '1px solid #ddd' }}>
            <div style={{ padding: '12px 16px', background: '#f5f5f5', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 800, flex: 1 }}>
                {name}
                {slug && <span style={{ fontWeight: 500, fontSize: '12px', color: '#888', marginLeft: '8px' }}>/products/{slug}</span>}
              </div>
              <span style={{ fontSize: '12px', color: '#888' }}>{rows.length} шт.</span>
              {pendingRows.length > 0 && (
                <button
                  onClick={() => notify(productId)}
                  disabled={notifying === productId}
                  style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '12px', padding: '6px 14px', border: '1.5px solid #1565c0', background: '#fff', color: '#1565c0', cursor: 'pointer' }}
                >
                  {notifying === productId ? 'отправляем...' : `уведомить (${pendingRows.length})`}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
              {rows.map((r: any) => (
                <div key={r.id} style={{ background: r.notified_at ? '#f9fff9' : '#fff', padding: '10px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', fontSize: '13px' }}>
                  <span style={{ fontSize: '11px', color: '#888', flexShrink: 0 }}>
                    {new Date(r.created_at).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                  <span style={{ fontWeight: 800 }}>{r.name}</span>
                  <a href={`https://telegram.me/${r.telegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', fontWeight: 700 }}>@{r.telegram}</a>
                  {r.size && <span style={{ color: '#555' }}>р.{r.size}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: r.notified_at ? '#090' : '#888' }}>
                    {r.notified_at ? `✓ уведомлён ${new Date(r.notified_at).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}` : 'ожидает'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
