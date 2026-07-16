'use client';
import { adminFetch } from '@/lib/adminFetch';
import { useEffect, useState } from 'react';
import { DELIVERY_SERVICES, DeliveryKey, normalizeServices } from '@/lib/delivery';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

const EMPTY_PRODUCT = { name: '', slug: '', price: '', oldPrice: '', material: '', image_url: '', images: '' };
const EMPTY_VARIANT = { attribute_value: '', stock: '0', to_produce: '0' };

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [preorderMode, setPreorderMode] = useState(false);
  const [deliveryServices, setDeliveryServices] = useState<DeliveryKey[]>(['cdek']);
  const [variants, setVariants] = useState<any[]>([{ ...EMPTY_VARIANT }]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [preorderCounts, setPreorderCounts] = useState<Record<string, number>>({});
  const [notifying, setNotifying] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminFetch('/api/admin/products', { headers: ah(), cache: 'no-store' }).then(r => r.json()),
      adminFetch('/api/admin/preorders', { headers: ah() }).then(r => r.json()),
    ]).then(([prods, preorders]) => {
      setProducts(Array.isArray(prods) ? prods : []);
      // Считаем только не уведомлённые предзаказы
      const counts: Record<string, number> = {};
      for (const p of (Array.isArray(preorders) ? preorders : [])) {
        if (!p.notified_at) counts[p.product_id] = (counts[p.product_id] ?? 0) + 1;
      }
      setPreorderCounts(counts);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing('new');
    setForm(EMPTY_PRODUCT);
    setPreorderMode(false);
    setDeliveryServices(['cdek']);
    setVariants([{ ...EMPTY_VARIANT }]);
  };

  const openEdit = (p: any) => {
    setEditing(p.id);
    setForm({
      name: p.name ?? '',
      slug: p.slug ?? '',
      price: p.price ?? '',
      oldPrice: p.oldPrice ?? '',
      material: p.material ?? '',
      image_url: p.image_url ?? '',
      images: Array.isArray(p.images) ? p.images.join(', ') : (p.images ?? ''),
    });
    setPreorderMode(p.preorder_mode ?? false);
    setDeliveryServices(normalizeServices(p.delivery_services ?? p.delivery));
    setVariants((p.product_variants ?? []).map((v: any) => ({
      attribute_value: v.attribute_value ?? '',
      stock: String(v.stock ?? 0),
      to_produce: String(v.to_produce ?? 0),
    })));
  };

  const cancel = () => { setEditing(null); };

  const setField = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));
  const setVariantField = (i: number, k: string, v: string) => setVariants(vs => vs.map((vv, idx) => idx === i ? { ...vv, [k]: v } : vv));
  const addVariant = () => setVariants(vs => [...vs, { ...EMPTY_VARIANT }]);
  const removeVariant = (i: number) => setVariants(vs => vs.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      material: form.material,
      image_url: form.image_url,
      images: form.images ? form.images.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      delivery_services: deliveryServices.length ? deliveryServices : ['cdek'],
      preorder_mode: preorderMode,
      variants: variants.map(v => ({ attribute_value: v.attribute_value, stock: Number(v.stock), to_produce: Number(v.to_produce) })),
    };

    try {
      const res = editing === 'new'
        ? await adminFetch('/api/admin/products', { method: 'POST', headers: ah(), body: JSON.stringify(payload) })
        : await adminFetch(`/api/admin/products/${editing}`, { method: 'PUT', headers: ah(), body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Ошибка ${res.status}: ${(err as any).error ?? 'неизвестная ошибка'}`);
        setSaving(false);
        return;
      }
      setEditing(null);
      load();
    } catch (e) {
      alert('Сетевая ошибка: ' + String(e));
    }
    setSaving(false);
  };

  const del = async (id: string) => {
    if (!confirm('удалить товар?')) return;
    setDeleting(id);
    await adminFetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: ah() });
    setDeleting(null);
    load();
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= products.length) return;
    setReordering(true);
    // Если sort_order ещё ни у кого не выставлен (миграция только что применена) — нормализуем
    // весь текущий порядок в конкретные значения перед первой перестановкой.
    const needsInit = products.some(p => p.sort_order == null);
    const list = needsInit ? products.map((p, i) => ({ ...p, sort_order: i })) : products;
    if (needsInit) {
      await Promise.all(list.map(p =>
        adminFetch(`/api/admin/products/${p.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: p.sort_order }) })
      ));
    }
    const a = list[idx], b = list[target];
    await Promise.all([
      adminFetch(`/api/admin/products/${a.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: b.sort_order }) }),
      adminFetch(`/api/admin/products/${b.id}`, { method: 'PUT', headers: ah(), body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    setReordering(false);
    load();
  };

  if (loading) return <div style={{ fontWeight: 800 }}>загрузка...</div>;

  if (editing !== null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontWeight: 800, fontSize: '16px' }}>{editing === 'new' ? 'новый товар' : 'редактировать товар'}</div>
          <button onClick={cancel} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888' }}>отмена</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
          {([
            ['name', 'название'],
            ['slug', 'slug (url)'],
            ['price', 'цена'],
            ['oldPrice', 'старая цена'],
            ['image_url', 'главное фото (url)'],
          ] as [string, string][]).map(([k, label]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: '#888' }}>{label}</label>
              <input value={form[k]} onChange={e => setField(k, e.target.value)} style={inp} />
            </div>
          ))}

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>сервисы доставки (можно несколько)</label>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {DELIVERY_SERVICES.map(({ key, label }) => {
              const checked = deliveryServices.includes(key);
              return (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setDeliveryServices(cur =>
                      cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]
                    )}
                    style={{ width: '16px', height: '16px', accentColor: '#000', cursor: 'pointer' }}
                  />
                  {label}
                </label>
              );
            })}
          </div>
          {deliveryServices.length === 0 && (
            <span style={{ fontSize: '11px', color: '#c00' }}>выберите хотя бы один сервис (иначе будет СДЭК по умолчанию)</span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>описание / материал</label>
          <textarea value={form.material} onChange={e => setField('material', e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '11px', color: '#888' }}>дополнительные фото (через запятую)</label>
          <textarea value={form.images} onChange={e => setField('images', e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontWeight: 800, fontSize: '13px' }}>размеры / варианты</div>
            <button onClick={addVariant} style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid #000', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>+ добавить</button>
          </div>
          {variants.map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 70px 70px 36px', gap: '8px', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#888' }}>размер</label>
                <input value={v.attribute_value} onChange={e => setVariantField(i, 'attribute_value', e.target.value)} style={inp} placeholder="XS, S, M..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#888' }}>в наличии</label>
                <input type="number" value={v.stock} onChange={e => setVariantField(i, 'stock', e.target.value)} style={inp} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#888' }}>под заказ</label>
                <input type="number" value={v.to_produce} onChange={e => setVariantField(i, 'to_produce', e.target.value)} style={inp} />
              </div>
              <button onClick={() => removeVariant(i)} style={{ padding: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#c00', fontSize: '16px' }}>×</button>
            </div>
          ))}
        </div>

        {/* Режим предзаказа */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: preorderMode ? '2px solid #d32f2f' : '1px solid #eee', background: preorderMode ? '#fff8f8' : '#fafafa' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '13px' }}>режим предзаказа</div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
              покупатели не смогут добавить в корзину — только оставить предзаказ. при отключении все подписчики получат уведомление в Telegram.
            </div>
          </div>
          <button
            onClick={() => setPreorderMode(v => !v)}
            style={{ padding: '8px 16px', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', border: '2px solid #000', background: preorderMode ? '#d32f2f' : '#fff', color: preorderMode ? '#fff' : '#000', cursor: 'pointer', flexShrink: 0 }}
          >
            {preorderMode ? 'включён' : 'выключен'}
          </button>
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
        <div style={{ fontWeight: 800, fontSize: '18px' }}>товары ({products.length})</div>
        <button onClick={openCreate} style={{ padding: '8px 16px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}>+ добавить</button>
        <a href="/products" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#888' }}>смотреть каталог →</a>
      </div>

      {products.length === 0 && <div style={{ color: '#888' }}>товаров пока нет</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
        {products.map((p, i) => {
          const pCount = preorderCounts[p.id] ?? 0;
          return (
            <div key={p.id} style={{ background: p.preorder_mode ? '#fff8f8' : '#fff', display: 'flex', gap: '16px', padding: '14px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button onClick={() => move(i, -1)} disabled={i === 0 || reordering} style={arrowBtn}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === products.length - 1 || reordering} style={arrowBtn}>▼</button>
              </div>
              {p.image_url && <img src={p.image_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {p.name}
                  {p.preorder_mode && <span style={{ fontSize: '10px', fontWeight: 800, background: '#d32f2f', color: '#fff', padding: '2px 6px' }}>ПРЕДЗАКАЗ</span>}
                  {pCount > 0 && <span style={{ fontSize: '10px', fontWeight: 800, background: '#1565c0', color: '#fff', padding: '2px 6px' }}>{pCount} предзаказов</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>{p.slug} · {Number(p.price).toLocaleString('ru')} ₽{p.oldPrice ? ` (было ${Number(p.oldPrice).toLocaleString('ru')} ₽)` : ''}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                {(p.product_variants ?? []).map((v: any) => (
                  <span key={v.id} style={{ fontSize: '11px', padding: '2px 6px', background: v.stock > 0 ? '#e8f5e9' : '#fafafa', border: '1px solid #ddd' }}>
                    {v.attribute_value}: {v.stock}шт{v.to_produce > 0 ? ` +${v.to_produce}` : ''}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                {pCount > 0 && !p.preorder_mode && (
                  <button
                    onClick={async () => {
                      setNotifying(p.id);
                      await adminFetch('/api/admin/preorders/notify', { method: 'POST', headers: ah(), body: JSON.stringify({ product_id: p.id }) });
                      setNotifying(null);
                      load();
                    }}
                    disabled={notifying === p.id}
                    style={{ ...btnSecondary, color: '#1565c0', borderColor: '#1565c0' }}
                  >
                    {notifying === p.id ? '...' : `уведомить (${pCount})`}
                  </button>
                )}
                <a href={`/products/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ ...btnSecondary, textDecoration: 'none', color: '#000', display: 'inline-block' }}>смотреть</a>
                <button onClick={() => openEdit(p)} style={btnSecondary}>изменить</button>
                <button onClick={() => del(p.id)} disabled={deleting === p.id} style={{ ...btnSecondary, color: '#c00', borderColor: '#c00' }}>
                  {deleting === p.id ? '...' : 'удалить'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnSecondary: React.CSSProperties = { padding: '6px 12px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '12px', cursor: 'pointer', fontWeight: 700 };
const arrowBtn: React.CSSProperties = { padding: '2px 6px', border: '1px solid #ccc', background: '#fff', fontFamily: 'inherit', fontSize: '10px', cursor: 'pointer', lineHeight: 1 };
