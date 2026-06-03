'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const MAX_BYTES = 6 * 1024 * 1024;

// Сжимаем большие фото в браузере перед отправкой (как в админке /admin/upload).
async function compressToLimit(file: File, maxBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX_DIM = 2400;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      let bestBlob: Blob | null = null;
      const try_ = (q: number, cb: (b: Blob) => void) => canvas.toBlob(b => { if (b) cb(b); }, 'image/jpeg', q);
      const step = (lo: number, hi: number, i: number) => {
        if (i > 8) { resolve(bestBlob!); return; }
        const mid = (lo + hi) / 2;
        try_(mid, blob => {
          if (blob.size <= maxBytes) { bestBlob = blob; lo = mid; } else { hi = mid; }
          if (hi - lo < 0.02) { resolve(bestBlob || blob); return; }
          step(lo, hi, i + 1);
        });
      };
      try_(0.95, blob => { if (blob.size <= maxBytes) { resolve(blob); return; } bestBlob = blob; step(0.1, 0.95, 0); });
    };
    img.onerror = reject; img.src = url;
  });
}

type Pending = { file: File; preview: string };

export default function CollabModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [pending, setPending] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Закрытие по Esc + блокировка прокрутки фона.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    setPending(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))].slice(0, 12));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, []);

  const submit = async () => {
    setError('');
    if (!name.trim()) { setError('укажите имя'); return; }
    if (!telegram.trim() && !phone.trim()) { setError('оставьте телеграм или телефон'); return; }
    if (!title.trim() && !description.trim()) { setError('опишите идею или товар'); return; }

    setSubmitting(true);
    try {
      // 1. Загружаем фото
      const urls: string[] = [];
      for (const { file } of pending) {
        let blob: Blob = file;
        let asJpeg = false;
        if (file.size > MAX_BYTES) { blob = await compressToLimit(file, MAX_BYTES); asJpeg = true; }
        const ext = asJpeg ? 'jpg' : (file.name.split('.').pop() || 'jpg');
        const fd = new FormData();
        fd.append('file', new File([blob], `photo.${ext}`, { type: asJpeg ? 'image/jpeg' : file.type }));
        const res = await fetch('/api/collab/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'не удалось загрузить фото');
        urls.push(data.url);
      }

      // 2. Отправляем заявку
      const res = await fetch('/api/collab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, telegram, phone, title, description, price, images: urls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'не удалось отправить заявку');
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'что-то пошло не так');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto', fontFamily: 'inherit' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', color: '#000', width: '100%', maxWidth: '640px', margin: 'auto', border: '2px solid #000', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ fontWeight: 800, fontSize: '17px', textTransform: 'lowercase', lineHeight: 1.3 }}>
            предложить товар в коллаборацию с whatislove
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 800, lineHeight: 1, color: '#000', flexShrink: 0 }}>×</button>
        </div>

        {done ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
            <div style={{ fontWeight: 800, fontSize: '15px' }}>заявка отправлена ✓</div>
            <div style={{ fontSize: '14px', lineHeight: 1.5, color: '#444' }}>
              спасибо! мы посмотрим вашу идею и свяжемся с вами по указанным контактам.
            </div>
            <button onClick={onClose} style={btnPrimary}>закрыть</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, marginTop: '-6px' }}>
              прикрепите фото товара или эскизов, опишите идею, предложите цену и оставьте контакты — мы рассмотрим заявку.
            </div>

            {/* Контакты */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="ваше имя *"><input value={name} onChange={e => setName(e.target.value)} style={inp} placeholder="как к вам обращаться" /></Field>
              <Field label="телеграм"><input value={telegram} onChange={e => setTelegram(e.target.value)} style={inp} placeholder="@username" /></Field>
              <Field label="телефон"><input value={phone} onChange={e => setPhone(e.target.value)} style={inp} placeholder="+7..." /></Field>
              <Field label="желаемая цена"><input value={price} onChange={e => setPrice(e.target.value)} style={inp} placeholder="напр. 3000 руб" /></Field>
            </div>

            <Field label="название товара / идеи">
              <input value={title} onChange={e => setTitle(e.target.value)} style={inp} placeholder="коротко" />
            </Field>

            <Field label="описание">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} placeholder="расскажите подробнее об идее, материалах, задумке..." />
            </Field>

            {/* Фото */}
            <Field label="фото товара / эскизов">
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                style={{ border: `2px dashed ${dragging ? '#000' : '#ccc'}`, padding: '22px 16px', textAlign: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '13px', background: dragging ? '#f5f5f5' : '#fff' }}
              >
                перетащите фото сюда или нажмите
                <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
              </div>
              {pending.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                  {pending.map(({ preview }, i) => (
                    <div key={i} style={{ position: 'relative', width: '74px' }}>
                      <img src={preview} alt="" style={{ width: '74px', height: '74px', objectFit: 'cover', display: 'block' }} />
                      <div onClick={() => setPending(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '14px', fontWeight: 800, padding: '0 5px', cursor: 'pointer' }}>×</div>
                    </div>
                  ))}
                </div>
              )}
            </Field>

            {error && <div style={{ fontSize: '13px', color: '#c00', fontWeight: 700 }}>{error}</div>}

            <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, cursor: submitting ? 'default' : 'pointer' }}>
              {submitting ? 'отправляем...' : 'отправить заявку'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '11px', color: '#888', textTransform: 'lowercase' }}>{label}</label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = { padding: '9px 11px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { padding: '12px 24px', background: '#000', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start', textTransform: 'lowercase' };
