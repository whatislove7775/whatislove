'use client';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

interface LinkRow { id: string; label: string; url: string; sort_order: number; column_id: string | null; }
interface ColumnRow { id: string; title: string; sort_order: number; }

export default function LinksAdminPage() {
  const [columns, setColumns] = useState<ColumnRow[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/link-columns', { headers: ah() }).then(r => r.json()),
      fetch('/api/admin/links', { headers: ah() }).then(r => r.json()),
    ]).then(([cols, lks]) => {
      setColumns(cols ?? []);
      setLinks(lks ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const grouped = (columnId: string | null) =>
    links.filter(l => (l.column_id ?? null) === columnId).sort((a, b) => a.sort_order - b.sort_order);

  // ---- columns ----
  const setColumnTitle = (id: string, title: string) =>
    setColumns(cs => cs.map(c => c.id === id ? { ...c, title } : c));

  const saveColumn = async (c: ColumnRow) => {
    setBusy(c.id);
    await fetch(`/api/admin/link-columns/${c.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ title: c.title }) });
    setBusy(null);
  };

  const addColumn = async () => {
    setBusy('new-col');
    await fetch('/api/admin/link-columns', { method: 'POST', headers: ah(), body: JSON.stringify({ title: 'новая колонка' }) });
    setBusy(null);
    load();
  };

  const delColumn = async (id: string) => {
    if (!confirm('удалить колонку? ссылки в ней станут "без колонки"')) return;
    setBusy(id);
    await fetch(`/api/admin/link-columns/${id}`, { method: 'DELETE', headers: ah() });
    setBusy(null);
    load();
  };

  const moveColumn = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= columns.length) return;
    const a = columns[idx], b = columns[target];
    setBusy('reorder-col');
    await Promise.all([
      fetch(`/api/admin/link-columns/${a.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: b.sort_order }) }),
      fetch(`/api/admin/link-columns/${b.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    setBusy(null);
    load();
  };

  // ---- links ----
  const setLinkField = (id: string, k: 'label' | 'url', v: string) =>
    setLinks(ls => ls.map(l => l.id === id ? { ...l, [k]: v } : l));

  const saveLink = async (l: LinkRow) => {
    setBusy(l.id);
    await fetch(`/api/admin/links/${l.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ label: l.label, url: l.url }) });
    setBusy(null);
  };

  const addLink = async (columnId: string | null) => {
    setBusy('new-link');
    await fetch('/api/admin/links', { method: 'POST', headers: ah(), body: JSON.stringify({ label: 'новая ссылка', url: 'https://', column_id: columnId }) });
    setBusy(null);
    load();
  };

  const delLink = async (id: string) => {
    if (!confirm('удалить ссылку?')) return;
    setBusy(id);
    await fetch(`/api/admin/links/${id}`, { method: 'DELETE', headers: ah() });
    setBusy(null);
    load();
  };

  const moveLink = async (group: LinkRow[], idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= group.length) return;
    const a = group[idx], b = group[target];
    setBusy('reorder-link');
    await Promise.all([
      fetch(`/api/admin/links/${a.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: b.sort_order }) }),
      fetch(`/api/admin/links/${b.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    setBusy(null);
    load();
  };

  const setLinkColumn = async (l: LinkRow, columnId: string | null) => {
    const group = grouped(columnId);
    const nextOrder = group.length > 0 ? Math.max(...group.map(x => x.sort_order)) + 1 : 0;
    setBusy(l.id);
    await fetch(`/api/admin/links/${l.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ column_id: columnId, sort_order: nextOrder }) });
    setBusy(null);
    load();
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  const unassigned = grouped(null);

  const renderLinkRow = (l: LinkRow, group: LinkRow[], idx: number) => (
    <div key={l.id} style={{ background: '#fff', display: 'flex', gap: '10px', padding: '10px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <button onClick={() => moveLink(group, idx, -1)} disabled={idx === 0 || busy === 'reorder-link'} style={arrowBtn}>▲</button>
        <button onClick={() => moveLink(group, idx, 1)} disabled={idx === group.length - 1 || busy === 'reorder-link'} style={arrowBtn}>▼</button>
      </div>
      <input
        value={l.label}
        onChange={e => setLinkField(l.id, 'label', e.target.value)}
        onBlur={() => saveLink(l)}
        placeholder="подпись, напр. [КАНАЛ В ТГ]"
        style={{ ...inp, width: '200px' }}
      />
      <input
        value={l.url}
        onChange={e => setLinkField(l.id, 'url', e.target.value)}
        onBlur={() => saveLink(l)}
        placeholder="https://..."
        style={{ ...inp, flex: 1, minWidth: '160px' }}
      />
      <select value={l.column_id ?? ''} onChange={e => setLinkColumn(l, e.target.value || null)} style={{ ...inp, width: '160px' }}>
        <option value="">без колонки</option>
        {columns.map(c => <option key={c.id} value={c.id}>{c.title || '(без названия)'}</option>)}
      </select>
      {busy === l.id && <span style={{ fontSize: '11px', color: '#888' }}>...</span>}
      <button onClick={() => delLink(l.id)} disabled={busy === l.id} style={{ ...btnSecondary, color: '#c00', borderColor: '#c00' }}>удалить</button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>ссылки</div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          страница /links. без колонок все ссылки идут одной строкой, как раньше. добавьте колонку — ссылки в ней будут показаны отдельной группой с заголовком.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px' }}>колонки ({columns.length})</div>
        <button onClick={addColumn} disabled={busy === 'new-col'} style={btnPrimary}>+ добавить колонку</button>
      </div>

      {columns.map((c, i) => {
        const group = grouped(c.id);
        return (
          <div key={c.id} style={{ border: '1px solid #ddd', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button onClick={() => moveColumn(i, -1)} disabled={i === 0 || busy === 'reorder-col'} style={arrowBtn}>▲</button>
                <button onClick={() => moveColumn(i, 1)} disabled={i === columns.length - 1 || busy === 'reorder-col'} style={arrowBtn}>▼</button>
              </div>
              <input
                value={c.title}
                onChange={e => setColumnTitle(c.id, e.target.value)}
                onBlur={() => saveColumn(c)}
                placeholder="название колонки"
                style={{ ...inp, width: '220px', fontWeight: 800 }}
              />
              <button onClick={() => addLink(c.id)} disabled={busy === 'new-link'} style={btnSecondary}>+ ссылка</button>
              <button onClick={() => delColumn(c.id)} disabled={busy === c.id} style={{ ...btnSecondary, marginLeft: 'auto', color: '#c00', borderColor: '#c00' }}>
                удалить колонку
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
              {group.length === 0 && <div style={{ background: '#fff', padding: '10px 16px', color: '#888', fontSize: '13px' }}>ссылок в колонке пока нет</div>}
              {group.map((l, idx) => renderLinkRow(l, group, idx))}
            </div>
          </div>
        );
      })}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
          <div style={{ fontWeight: 800, fontSize: '14px' }}>без колонки ({unassigned.length})</div>
          <button onClick={() => addLink(null)} disabled={busy === 'new-link'} style={btnSecondary}>+ ссылка</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
          {unassigned.length === 0 && <div style={{ background: '#fff', padding: '10px 16px', color: '#888', fontSize: '13px' }}>нет</div>}
          {unassigned.map((l, idx) => renderLinkRow(l, unassigned, idx))}
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { padding: '8px 16px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 700 };
const arrowBtn: React.CSSProperties = { padding: '2px 6px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '10px', cursor: 'pointer', lineHeight: 1 };
