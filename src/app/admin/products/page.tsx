'use client';
import { useEffect, useState } from 'react';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '', 'Content-Type': 'application/json' }; }

const EMPTY_PRODUCT = { name: '', slug: '', price: '', oldPrice: '', material: '', image_url: '', images: '', delivery: 'cdek' };
const EMPTY_VARIANT = { attribute_value: '', stock: '0', to_produce: '0' };

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [variants, setVariants] = useState<any[]>([{ ...EMPTY_VARIANT }]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/products', { headers: ah(), cache: 'no-store' }).then(r => r.json()).then(d => { setProducts(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing('new');
    setForm(EMPTY_PRODUCT);
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
      delivery: p.delivery ?? 'cdek',
    });
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
      delivery: form.delivery,
      variants: variants.map(v => ({ attribute_value: v.attribute_value, stock: Number(v.stock), to_produce: Number(v.to_produce) })),
    };

    try {
      const res = editing === 'new'
        ? await fetch('/api/admin/products', { method: 'POST', headers: ah(), body: JSON.stringify(payload) })
        : await fetch(`/api/admin/products/${editing}`, { method: 'PUT', headers: ah(), body: JSON.stringify(payload) });
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
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: ah() });
    setDeleting(null);
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#888' }}>доставка</label>
            <select value={form.delivery} onChange={e => setField('delivery', e.target.value)} style={inp}>
              <option value="cdek">СДЭК</option>
              <option value="yandex">Яндекс.Доставка</option>
              <option value="both">обе</option>
            </select>
          </div>
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
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px auto', gap: '8px', alignItems: 'end' }}>
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
      </div>

      {products.length === 0 && <div style={{ color: '#888' }}>товаров пока нет</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#eee' }}>
        {products.map(p => (
          <div key={p.id} style={{ background: '#fff', display: 'flex', gap: '16px', padding: '14px 16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {p.image_url && <img src={p.image_url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{p.slug} · {Number(p.price).toLocaleString('ru')} ₽{p.oldPrice ? ` (было ${Number(p.oldPrice).toLocaleString('ru')} ₽)` : ''}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
              {(p.product_variants ?? []).map((v: any) => (
                <span key={v.id} style={{ fontSize: '11px', padding: '2px 6px', background: v.stock > 0 ? '#e8f5e9' : '#fafafa', border: '1px solid #ddd' }}>
                  {v.attribute_value}: {v.stock}шт{v.to_produce > 0 ? ` +${v.to_produce}` : ''}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => openEdit(p)} style={btnSecondary}>изменить</button>
              <button onClick={() => del(p.id)} disabled={deleting === p.id} style={{ ...btnSecondary, color: '#c00', borderColor: '#c00' }}>
                {deleting === p.id ? '...' : 'удалить'}
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
