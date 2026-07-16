'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/adminFetch';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shipping, setShipping] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/api/admin/orders', { headers: ah() }).then(r => r.json()).then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  const toggleShipped = async (order: any, shipped: boolean) => {
    setShipping(order.id);
    await adminFetch('/api/admin/orders', { method: 'PATCH', headers: ah(), body: JSON.stringify({ id: order.id, shipped }) });
    setOrders(cur => cur.map(o => o.id === order.id ? { ...o, shipped, shipped_at: shipped ? new Date().toISOString() : null } : o));
    setShipping(null);
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  const shippedCount = orders.filter(o => o.shipped).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontWeight: 800, fontSize: '18px' }}>
        заказы ({orders.length})
        {orders.length > 0 && <span style={{ fontSize: '13px', color: '#888', marginLeft: '8px' }}>отправлено {shippedCount} из {orders.length}</span>}
      </div>

      {orders.length === 0 && <div style={{ color: '#888' }}>заказов пока нет</div>}

      {orders.map((order) => {
        const o = order.order_data ?? {};
        const isOpen = expanded === order.id;
        return (
          <div key={order.id} style={{ border: order.shipped ? '1px solid #7bc47f' : '1px solid #ddd', background: order.shipped ? '#f4fff4' : '#fff' }}>
            <div style={{ padding: '14px 16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : order.id)}>
              <span style={{ fontSize: '12px', color: '#888', flexShrink: 0 }}>{new Date(order.created_at).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
              <span style={{ fontWeight: 800 }}>{o.name}</span>
              <span style={{ color: '#0088cc' }}>{o.tg}</span>
              <span style={{ color: '#555' }}>{o.city}</span>
              <span style={{ color: '#555', flex: 1 }}>{o.delivery}</span>
              {order.shipped && <span style={{ fontSize: '10px', fontWeight: 800, background: '#2e7d32', color: '#fff', padding: '2px 6px' }}>ОТПРАВЛЕН</span>}
              <span style={{ fontWeight: 800 }}>{Number(o.totalPaid ?? 0).toLocaleString('ru')} ₽</span>
              <span style={{ fontSize: '12px', color: '#888' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
              <div style={{ borderTop: '1px solid #eee', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#fafafa' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleShipped(order, !order.shipped)}
                    disabled={shipping === order.id}
                    style={{
                      padding: '8px 16px', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                      border: '2px solid #2e7d32',
                      background: order.shipped ? '#fff' : '#2e7d32',
                      color: order.shipped ? '#2e7d32' : '#fff',
                    }}
                  >
                    {shipping === order.id ? '...' : order.shipped ? '↩ снять отметку «отправлен»' : '✓ отметить отправленным'}
                  </button>
                  {order.shipped && order.shipped_at && (
                    <span style={{ fontSize: '12px', color: '#2e7d32' }}>
                      отправлен {new Date(order.shipped_at).toLocaleDateString('ru', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px', fontSize: '13px' }}>
                  {[
                    ['email', o.email],
                    ['телефон', o.phone],
                    ['город', o.city],
                    ['служба доставки', o.delivery],
                    ['адрес', o.address],
                    ['стоимость доставки', `${o.deliveryCost} ₽`],
                    ['payment id', order.payment_id],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '11px', color: '#888', textTransform: 'lowercase' }}>{k}</div>
                      <div style={{ fontWeight: 700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>состав заказа</div>
                  {(o.items ?? []).map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '6px 0', borderBottom: '1px solid #eee', fontSize: '13px' }}>
                      <span style={{ fontWeight: 700, flex: 1 }}>{item.name}</span>
                      <span>р.{item.size}</span>
                      <span>x{item.quantity}</span>
                      <span style={{ fontWeight: 700 }}>{item.price * item.quantity} ₽</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
