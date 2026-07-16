'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// role: 'owner' видит всё; 'processor' — только обработку заказов.
const NAV = [
  { href: '/admin', label: 'статистика', owner: true },
  { href: '/admin/products', label: 'товары', owner: true },
  { href: '/admin/orders', label: 'заказы', owner: false },
  { href: '/admin/preorders', label: 'предзаказы', owner: false },
  { href: '/admin/collab', label: 'коллабы', owner: true },
  { href: '/admin/portfolio', label: 'портфолио', owner: true },
  { href: '/admin/links', label: 'ссылки', owner: true },
  { href: '/admin/settings', label: 'настройки', owner: true },
  { href: '/admin/upload', label: 'фото', owner: true },
  { href: '/admin/team', label: 'команда', owner: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [role, setRole] = useState<'owner' | 'processor'>('owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const key = localStorage.getItem('admin_key');
    setAuthed(!!key);
    setRole((localStorage.getItem('admin_role') as 'owner' | 'processor') || 'owner');
  }, []);

  const login = async () => {
    setError('');
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      localStorage.setItem('admin_key', password);
      localStorage.setItem('admin_role', data.role ?? 'owner');
      setRole(data.role ?? 'owner');
      setAuthed(true);
    } else if (res.status === 429) {
      setError(data.message ?? 'слишком много попыток, попробуйте позже');
    } else {
      setError('неверный пароль');
    }
  };

  const nav = NAV.filter(item => role === 'owner' || !item.owner);
  const canViewCurrent = role === 'owner' || nav.some(({ href }) =>
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href)
  );

  if (authed === null) return null;

  if (!authed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '12px', fontFamily: 'inherit' }}>
        <div style={{ fontWeight: 800, fontSize: '18px' }}>wh4t admin</div>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="пароль"
          autoFocus
          style={{ padding: '10px 14px', border: '1px solid #000', fontFamily: 'inherit', fontSize: '14px', width: '220px', outline: 'none' }}
        />
        {error && <div style={{ fontSize: '12px', color: '#c00' }}>{error}</div>}
        <button onClick={login} style={{ padding: '10px 24px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
          войти
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'inherit', fontSize: '14px' }}>
      <nav style={{ borderBottom: '2px solid #000', padding: '0 12px', display: 'flex', gap: '0', alignItems: 'stretch', background: '#fff', position: 'sticky', top: 0, zIndex: 100, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <span style={{ fontWeight: 800, fontSize: '15px', padding: '14px 12px 14px 0', borderRight: '1px solid #eee', marginRight: '4px', flexShrink: 0 }}>admin</span>
        {nav.map(({ href, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);
          return (
            <Link key={href} href={href} style={{ padding: '14px 10px', fontWeight: 800, fontSize: '13px', color: '#000', textDecoration: 'none', textTransform: 'lowercase', borderBottom: active ? '2px solid #000' : '2px solid transparent', marginBottom: '-2px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => {
            localStorage.removeItem('admin_key');
            localStorage.removeItem('admin_role');
            setAuthed(false);
          }}
          style={{ marginLeft: 'auto', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 800, color: '#999', flexShrink: 0, paddingLeft: '12px', whiteSpace: 'nowrap' }}
        >
          выйти
        </button>
      </nav>
      <main style={{ padding: '16px', maxWidth: '1100px', margin: '0 auto' }}>
        {canViewCurrent ? children : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', color: '#666' }}>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>этот раздел доступен только владельцу</div>
            <Link href="/admin/orders" style={{ fontWeight: 800, color: '#000' }}>→ перейти к заказам</Link>
          </div>
        )}
      </main>
    </div>
  );
}
