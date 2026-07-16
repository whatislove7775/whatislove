'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

interface Member { id: string; username: string; password: string; role: string; created_at: string; }

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [reveal, setReveal] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    adminFetch('/api/admin/admin-users', { headers: ah() })
      .then(r => r.json())
      .then(d => { setMembers(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    setError('');
    if (!username.trim() || !password.trim()) { setError('укажите имя и пароль'); return; }
    setSaving(true);
    const res = await adminFetch('/api/admin/admin-users', {
      method: 'POST', headers: ah(),
      body: JSON.stringify({ username: username.trim(), password: password.trim(), role: 'processor' }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'не удалось добавить'); return; }
    setUsername(''); setPassword('');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('удалить сотрудника? он больше не сможет войти')) return;
    setDeleting(id);
    await adminFetch(`/api/admin/admin-users/${id}`, { method: 'DELETE', headers: ah() });
    setMembers(cur => cur.filter(m => m.id !== id));
    setDeleting(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: '18px', marginBottom: '6px' }}>команда</div>
        <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
          сотрудники для обработки заказов. они входят в админку по своему паролю и видят
          только разделы «заказы» и «предзаказы» — могут смотреть данные доставки и отмечать
          отправку, но не управляют товарами и настройками.
        </div>
      </div>

      {/* Добавление */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>имя сотрудника</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="напр. Аня" style={{ ...inp, width: '160px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>пароль для входа</label>
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="придумайте пароль" style={{ ...inp, width: '200px' }} />
        </div>
        <button onClick={add} disabled={saving} style={btnPrimary}>{saving ? '...' : '+ добавить'}</button>
      </div>
      {error && <div style={{ fontSize: '13px', color: '#c00', fontWeight: 700 }}>{error}</div>}

      {/* Список */}
      {loading ? (
        <div style={{ fontWeight: 800 }}>загрузка...</div>
      ) : members.length === 0 ? (
        <div style={{ color: '#888', fontSize: '13px' }}>сотрудников пока нет</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
          {members.map(m => (
            <div key={m.id} style={{ background: '#fff', padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800 }}>{m.username}</span>
              <span style={{ fontSize: '11px', color: '#888', border: '1px solid #ddd', padding: '1px 6px' }}>{m.role === 'owner' ? 'владелец' : 'обработчик'}</span>
              <span style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>
                пароль: {reveal === m.id ? m.password : '••••••'}
                <button onClick={() => setReveal(reveal === m.id ? null : m.id)} style={{ marginLeft: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#0066cc', fontSize: '11px' }}>
                  {reveal === m.id ? 'скрыть' : 'показать'}
                </button>
              </span>
              <button onClick={() => del(m.id)} disabled={deleting === m.id} style={{ ...btnSecondary, marginLeft: 'auto', color: '#c00', borderColor: '#c00' }}>
                {deleting === m.id ? '...' : 'удалить'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { padding: '8px 16px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 700 };
