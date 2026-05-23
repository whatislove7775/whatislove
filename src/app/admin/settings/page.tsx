'use client';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [bottomText, setBottomText] = useState('');

  const load = () => {
    fetch('/api/admin/settings', { headers: ah() }).then(r => r.json()).then(d => {
      setSettings(d ?? {});
      setBottomText(d?.product_bottom_text ?? '');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const toggle = async (key: string, current: string) => {
    const next = current === 'true' ? 'false' : 'true';
    setSaving(key);
    await fetch('/api/admin/settings', { method: 'POST', headers: ah(), body: JSON.stringify({ key, value: next }) });
    setSaving(null);
    load();
  };

  const saveText = async () => {
    setSaving('product_bottom_text');
    await fetch('/api/admin/settings', { method: 'POST', headers: ah(), body: JSON.stringify({ key: 'product_bottom_text', value: bottomText }) });
    setSaving(null);
    load();
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  const deliveryEnabled = settings.delivery_enabled !== 'false';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px' }}>
      <div style={{ fontWeight: 800, fontSize: '18px' }}>настройки</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px' }}>доставка</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: '1px solid #ddd' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>стоимость доставки</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
              {deliveryEnabled ? 'включена — покупатели оплачивают доставку' : 'выключена — доставка бесплатная (для тестов)'}
            </div>
          </div>
          <button
            onClick={() => toggle('delivery_enabled', String(deliveryEnabled))}
            disabled={saving === 'delivery_enabled'}
            style={{
              padding: '10px 20px',
              background: deliveryEnabled ? '#000' : '#fff',
              color: deliveryEnabled ? '#fff' : '#000',
              border: '2px solid #000',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              minWidth: '100px',
            }}
          >
            {saving === 'delivery_enabled' ? '...' : deliveryEnabled ? 'включена' : 'выключена'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px' }}>страница товара</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: '#888' }}>текст под кнопкой "добавить в корзину" (HTML поддерживается)</label>
          <textarea
            value={bottomText}
            onChange={e => setBottomText(e.target.value)}
            rows={4}
            style={{ padding: '10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', resize: 'vertical' }}
            placeholder="например: &lt;b&gt;бесплатная доставка&lt;/b&gt; от 5000 ₽"
          />
          <button
            onClick={saveText}
            disabled={saving === 'product_bottom_text'}
            style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            {saving === 'product_bottom_text' ? 'сохраняем...' : 'сохранить'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontWeight: 800, fontSize: '14px' }}>прочие параметры</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
          {Object.entries(settings)
            .filter(([k]) => !['delivery_enabled', 'product_bottom_text'].includes(k))
            .map(([k, v]) => (
              <div key={k} style={{ background: '#fff', padding: '12px 16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{k}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{v}</div>
                </div>
              </div>
            ))}
          {Object.keys(settings).filter(k => !['delivery_enabled', 'product_bottom_text'].includes(k)).length === 0 && (
            <div style={{ background: '#fff', padding: '16px', color: '#888', fontSize: '13px' }}>нет дополнительных настроек</div>
          )}
        </div>
      </div>
    </div>
  );
}
