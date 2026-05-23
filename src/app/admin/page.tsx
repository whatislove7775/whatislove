'use client';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/stats', { headers: ah() }).then(r => r.json()).then(setStats);
  }, []);

  if (!stats) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ fontWeight: 800, fontSize: '18px' }}>статистика</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'всего заказов', value: stats.totalOrders },
          { label: 'выручка всего', value: `${stats.totalRevenue.toLocaleString('ru')} ₽` },
          { label: 'заказов в этом месяце', value: stats.monthOrders },
          { label: 'выручка в этом месяце', value: `${stats.monthRevenue.toLocaleString('ru')} ₽` },
        ].map(({ label, value }) => (
          <div key={label} style={{ border: '2px solid #000', padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#666', textTransform: 'lowercase', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '24px' }}>{value}</div>
          </div>
        ))}
      </div>

      {stats.topProducts?.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>топ товаров</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '12px' }}>товар</th>
                <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '12px' }}>продано (шт)</th>
                <th style={{ padding: '8px 12px', fontWeight: 800, fontSize: '12px' }}>выручка</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: '10px 12px' }}>{p.qty}</td>
                  <td style={{ padding: '10px 12px' }}>{p.revenue.toLocaleString('ru')} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.recent?.length > 0 && (
        <div>
          <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>последние заказы</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recent.map((o: any, i: number) => (
              <div key={i} style={{ border: '1px solid #eee', padding: '12px 16px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>{new Date(o.created_at).toLocaleDateString('ru')}</span>
                <span style={{ fontWeight: 800 }}>{o.name}</span>
                <span style={{ color: '#555' }}>{o.tg}</span>
                <span style={{ color: '#555' }}>{o.city}</span>
                <span style={{ fontWeight: 800, marginLeft: 'auto' }}>{o.totalPaid?.toLocaleString('ru')} ₽</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
