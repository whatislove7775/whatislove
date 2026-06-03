'use client';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

export default function CollabPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/collab', { headers: ah() })
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    await fetch(`/api/admin/collab/${id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ status }) });
    setItems(its => its.map(i => i.id === id ? { ...i, status } : i));
    setBusy(null);
  };

  const del = async (id: string) => {
    if (!confirm('удалить заявку?')) return;
    setBusy(id);
    await fetch(`/api/admin/collab/${id}`, { method: 'DELETE', headers: ah() });
    setItems(its => its.filter(i => i.id !== id));
    setBusy(null);
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  const newCount = items.filter(i => i.status === 'new').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontWeight: 800, fontSize: '18px' }}>
        коллаборации ({items.length}){newCount > 0 && <span style={{ color: '#c00', fontSize: '13px', marginLeft: '8px' }}>{newCount} новых</span>}
      </div>

      {items.length === 0 && <div style={{ color: '#888' }}>заявок пока нет</div>}

      {items.map((it) => {
        const isOpen = expanded === it.id;
        const imgs: string[] = Array.isArray(it.images) ? it.images : [];
        return (
          <div key={it.id} style={{ border: '1px solid #ddd', background: it.status === 'new' ? '#fffdf5' : '#fff' }}>
            <div
              onClick={() => setExpanded(isOpen ? null : it.id)}
              style={{ padding: '14px 16px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '12px', color: '#888', flexShrink: 0 }}>
                {new Date(it.created_at).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </span>
              {it.status === 'new' && <span style={{ fontSize: '10px', fontWeight: 800, background: '#c00', color: '#fff', padding: '2px 6px' }}>NEW</span>}
              <span style={{ fontWeight: 800 }}>{it.name}</span>
              {it.telegram && <span style={{ color: '#0088cc' }}>{it.telegram}</span>}
              {it.phone && <span style={{ color: '#555' }}>{it.phone}</span>}
              <span style={{ color: '#555', flex: 1, minWidth: '120px' }}>{it.title || it.description?.slice(0, 60)}</span>
              {it.price && <span style={{ fontWeight: 800 }}>{it.price}</span>}
              {imgs.length > 0 && <span style={{ fontSize: '12px', color: '#888' }}>🖼 {imgs.length}</span>}
              <span style={{ fontSize: '12px', color: '#888' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div style={{ borderTop: '1px solid #eee', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafa' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '13px' }}>
                  {[
                    ['имя', it.name],
                    ['телеграм', it.telegram],
                    ['телефон', it.phone],
                    ['название', it.title],
                    ['желаемая цена', it.price],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '11px', color: '#888' }}>{k}</div>
                      <div style={{ fontWeight: 700 }}>{v || '—'}</div>
                    </div>
                  ))}
                </div>

                {it.description && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>описание</div>
                    <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{it.description}</div>
                  </div>
                )}

                {imgs.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>фото ({imgs.length})</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {imgs.map((u, i) => (
                        <img key={i} src={u} alt="" onClick={() => setLightbox(u)}
                          style={{ width: '110px', height: '110px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #ddd' }} />
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                  {it.status !== 'seen' && (
                    <button onClick={() => setStatus(it.id, 'seen')} disabled={busy === it.id} style={btnSecondary}>отметить просмотренным</button>
                  )}
                  {it.status !== 'archived' && (
                    <button onClick={() => setStatus(it.id, 'archived')} disabled={busy === it.id} style={btnSecondary}>в архив</button>
                  )}
                  {it.status !== 'new' && (
                    <button onClick={() => setStatus(it.id, 'new')} disabled={busy === it.id} style={btnSecondary}>вернуть в новые</button>
                  )}
                  <button onClick={() => del(it.id)} disabled={busy === it.id} style={{ ...btnSecondary, color: '#c00', borderColor: '#c00' }}>удалить</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', cursor: 'pointer' }}>
          <img src={lightbox} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        </div>
      )}
    </div>
  );
}

const btnSecondary: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 700 };
