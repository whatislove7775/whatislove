'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

const EMPTY_CASE = { title: '', slug: '', year: '', client: '', task: '', desc: '', tags: '', image_url: '', images: '', project_link: '' };
const EMPTY_CREDIT = { role: '', display: '', url: '' };

export default function PortfolioPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY_CASE);
  const [credits, setCredits] = useState<any[]>([{ ...EMPTY_CREDIT }]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/portfolio', { headers: ah() }).then(r => r.json()).then(d => { setCases(d ?? []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing('new');
    setForm(EMPTY_CASE);
    setCredits([{ ...EMPTY_CREDIT }]);
  };

  const openEdit = (c: any) => {
    setEditing(c.id);
    setForm({
      title: c.title ?? '',
      slug: c.slug ?? '',
      year: c.year ?? '',
      client: c.client ?? '',
      task: c.task ?? '',
      desc: c.desc ?? '',
      tags: (() => { const t = c.tags; if (!t) return ''; if (Array.isArray(t)) return t.join(', '); try { const p = JSON.parse(t); if (Array.isArray(p)) return p.join(', '); } catch {} return t; })(),
      image_url: c.image_url ?? '',
      images: Array.isArray(c.images) ? c.images.join(', ') : (c.images ?? ''),
      project_link: c.project_link ?? '',
    });
    const cr = Array.isArray(c.credits) && c.credits.length > 0 ? c.credits : [{ ...EMPTY_CREDIT }];
    setCredits(cr.map((x: any) => ({ role: x.role ?? '', display: x.display ?? '', url: x.url ?? '' })));
  };

  const cancel = () => { setEditing(null); };

  const setField = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));
  const setCreditField = (i: number, k: string, v: string) => setCredits(cs => cs.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const addCredit = () => setCredits(cs => [...cs, { ...EMPTY_CREDIT }]);
  const removeCredit = (i: number) => setCredits(cs => cs.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      year: form.year ? Number(form.year) : null,
      client: form.client,
      task: form.task,
      desc: form.desc,
      tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      image_url: form.image_url,
      images: form.images ? form.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      project_link: form.project_link,
      credits: credits.filter(c => c.role || c.display),
    };

    if (editing === 'new') {
      await adminFetch('/api/admin/portfolio', { method: 'POST', headers: ah(), body: JSON.stringify(payload) });
    } else {
      await adminFetch(`/api/admin/portfolio/${editing}`, { method: 'PUT', headers: ah(), body: JSON.stringify(payload) });
    }
    setSaving(false);
    setEditing(null);
    load();
  };

  const del = async (id: string) => {
    if (!confirm('удалить кейс?')) return;
    setDeleting(id);
    await adminFetch(`/api/admin/portfolio/${id}`, { method: 'DELETE', headers: ah() });
    setDeleting(null);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= cases.length) return;
    setReordering(true);
    // Если sort_order ещё ни у кого не выставлен (миграция только что применена) — нормализуем
    // весь текущий порядок в конкретные значения перед первой перестановкой.
    const needsInit = cases.some(c => c.sort_order == null);
    const list = needsInit ? cases.map((c, i) => ({ ...c, sort_order: i })) : cases;
    if (needsInit) {
      await Promise.all(list.map(c =>
        adminFetch(`/api/admin/portfolio/${c.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: c.sort_order }) })
      ));
    }
    const a = list[idx], b = list[target];
    await Promise.all([
      adminFetch(`/api/admin/portfolio/${a.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: b.sort_order }) }),
      adminFetch(`/api/admin/portfolio/${b.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    setReordering(false);
    load();
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  if (editing !== null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>{editing === 'new' ? 'новый кейс' : 'редактировать кейс'}</div>
          <button onClick={cancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888' }}>отмена</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {([
            ['title', 'название'],
            ['slug', 'slug (url)'],
            ['year', 'год'],
            ['client', 'клиент'],
            ['project_link', 'ссылка на проект'],
            ['image_url', 'главное фото (url)'],
          ] as [string, string][]).map(([k, label]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#888' }}>{label}</label>
              <input value={form[k]} onChange={e => setField(k, e.target.value)} style={inp} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>задача</label>
          <textarea value={form.task} onChange={e => setField('task', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>описание</label>
          <textarea value={form.desc} onChange={e => setField('desc', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>теги (через запятую)</label>
          <input value={form.tags} onChange={e => setField('tags', e.target.value)} style={inp} placeholder="дизайн, брендинг, логотип" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>дополнительные фото (через запятую)</label>
          <textarea value={form.images} onChange={e => setField('images', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontWeight: 800, fontSize: '13px' }}>авторы / роли</div>
            <button onClick={addCredit} style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #000', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>+ добавить</button>
          </div>
          {credits.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#888' }}>роль</label>
                <input value={c.role} onChange={e => setCreditField(i, 'role', e.target.value)} style={inp} placeholder="арт-директор" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#888' }}>имя</label>
                <input value={c.display} onChange={e => setCreditField(i, 'display', e.target.value)} style={inp} placeholder="Иван Иванов" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#888' }}>ссылка</label>
                <input value={c.url} onChange={e => setCreditField(i, 'url', e.target.value)} style={inp} placeholder="https://..." />
              </div>
              <button onClick={() => removeCredit(i)} style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#c00', fontSize: '16px' }}>×</button>
            </div>
          ))}
        </div>

        <button onClick={save} disabled={saving} style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start' }}>
          {saving ? 'сохраняем...' : 'сохранить'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontWeight: 800, fontSize: '18px' }}>портфолио ({cases.length})</div>
        <button onClick={openCreate} style={{ padding: '8px 16px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>+ добавить</button>
        <a href="/portfolio" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#888' }}>смотреть портфолио →</a>
      </div>

      {cases.length === 0 && <div style={{ color: '#888' }}>кейсов пока нет</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
        {cases.map((c, i) => (
          <div key={c.id} style={{ background: '#fff', display: 'flex', gap: '16px', padding: '14px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button onClick={() => move(i, -1)} disabled={i === 0 || reordering} style={arrowBtn}>▲</button>
              <button onClick={() => move(i, 1)} disabled={i === cases.length - 1 || reordering} style={arrowBtn}>▼</button>
            </div>
            {c.image_url && <img src={c.image_url} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{c.title}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{c.slug} · {c.year}{c.client ? ` · ${c.client}` : ''}</div>
              {Array.isArray(c.tags) && c.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {c.tags.map((t: string) => <span key={t} style={{ fontSize: '11px', padding: '1px 6px', background: '#f0f0f0', border: '1px solid #ddd' }}>{t}</span>)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <a href={`/portfolio/${c.slug}`} target="_blank" rel="noopener noreferrer" style={{ ...btnSecondary, textDecoration: 'none', color: '#000', display: 'inline-block' }}>смотреть</a>
              <button onClick={() => openEdit(c)} style={btnSecondary}>изменить</button>
              <button onClick={() => del(c.id)} disabled={deleting === c.id} style={{ ...btnSecondary, color: '#c00', borderColor: '#c00' }}>
                {deleting === c.id ? '...' : 'удалить'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnSecondary: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 700 };
const arrowBtn: React.CSSProperties = { padding: '2px 6px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '10px', cursor: 'pointer', lineHeight: 1 };
