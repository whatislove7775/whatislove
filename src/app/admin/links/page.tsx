'use client';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

export default function LinksAdminPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/links', { headers: ah() }).then(r => r.json()).then(d => { setLinks(d ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const setField = (id: string, k: string, v: string) =>
    setLinks(ls => ls.map(l => l.id === id ? { ...l, [k]: v } : l));

  const save = async (l: any) => {
    setBusy(l.id);
    await fetch(`/api/admin/links/${l.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ label: l.label, url: l.url }) });
    setBusy(null);
  };

  const add = async () => {
    setBusy('new');
    await fetch('/api/admin/links', { method: 'POST', headers: ah(), body: JSON.stringify({ label: 'новая ссылка', url: 'https://' }) });
    setBusy(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm('удалить ссылку?')) return;
    setBusy(id);
    await fetch(`/api/admin/links/${id}`, { method: 'DELETE', headers: ah() });
    setBusy(null);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    const a = links[idx], b = links[target];
    setBusy('reorder');
    await Promise.all([
      fetch(`/api/admin/links/${a.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: b.sort_order }) }),
      fetch(`/api/admin/links/${b.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    setBusy(null);
    load();
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '18px' }}>ссылки ({links.length})</div>
        <button onClick={add} disabled={busy === 'new'} style={btnPrimary}>+ добавить</button>
      </div>

      <div style={{ fontSize: '12px', color: '#888' }}>
        отображаются на странице /links в этом порядке. подпись — то, что видно слева (например «[КАНАЛ В ТГ]»).
      </div>

      {links.length === 0 && <div style={{ color: '#888' }}>ссылок пока нет</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
        {links.map((l, i) => (
          <div key={l.id} style={{ background: '#fff', display: 'flex', gap: '10px', padding: '12px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button onClick={() => move(i, -1)} disabled={i === 0 || busy === 'reorder'} style={arrowBtn}>▲</button>
              <button onClick={() => move(i, 1)} disabled={i === links.length - 1 || busy === 'reorder'} style={arrowBtn}>▼</button>
            </div>
            <input
              value={l.label}
              onChange={e => setField(l.id, 'label', e.target.value)}
              onBlur={() => save(l)}
              placeholder="подпись, напр. [КАНАЛ В ТГ]"
              style={{ ...inp, width: '220px' }}
            />
            <input
              value={l.url}
              onChange={e => setField(l.id, 'url', e.target.value)}
              onBlur={() => save(l)}
              placeholder="https://..."
              style={{ ...inp, flex: 1, minWidth: '200px' }}
            />
            {busy === l.id && <span style={{ fontSize: '11px', color: '#888' }}>сохранение...</span>}
            <button onClick={() => del(l.id)} disabled={busy === l.id} style={{ ...btnSecondary, color: '#c00', borderColor: '#c00' }}>
              удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { padding: '8px 16px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 700 };
const arrowBtn: React.CSSProperties = { padding: '2px 6px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '10px', cursor: 'pointer', lineHeight: 1 };
