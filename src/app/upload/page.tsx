'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const FOLDERS = ['cases/asiya-site', 'cases/asiya-merch', 'cases/snappy-silk-site', 'cases/egor-kreed-ring', 'products'];
const MAX_BYTES = 1 * 1024 * 1024; // 1 MB

async function compressToLimit(file: File, maxBytes: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if very large
      const MAX_DIM = 2400;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

      // Binary search for quality that fits in maxBytes
      let lo = 0.1, hi = 0.95, bestBlob: Blob | null = null;
      const tryQuality = (q: number, cb: (blob: Blob) => void) => {
        canvas.toBlob((b) => { if (b) cb(b); }, 'image/jpeg', q);
      };

      const step = (lo: number, hi: number, iter: number) => {
        if (iter > 8) { resolve(bestBlob!); return; }
        const mid = (lo + hi) / 2;
        tryQuality(mid, (blob) => {
          if (blob.size <= maxBytes) { bestBlob = blob; lo = mid; }
          else { hi = mid; }
          if (hi - lo < 0.02) { resolve(bestBlob || blob); return; }
          step(lo, hi, iter + 1);
        });
      };

      // First check if hi quality already fits
      tryQuality(hi, (blob) => {
        if (blob.size <= maxBytes) { resolve(blob); return; }
        bestBlob = blob;
        step(lo, hi, 0);
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function UploadPage() {
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [customFolder, setCustomFolder] = useState('');
  const [files, setFiles] = useState<{ file: File; preview: string }[]>([]);
  const [results, setResults] = useState<{ name: string; url: string; size: string; compressed: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [deliveryEnabled, setDeliveryEnabled] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(s => {
      setDeliveryEnabled(s.delivery_enabled !== 'false');
    });
  }, []);

  const toggleDelivery = async () => {
    setToggling(true);
    const next = !deliveryEnabled;
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'delivery_enabled', value: String(next) }),
    });
    setDeliveryEnabled(next);
    setToggling(false);
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    setResults([]);
    const target = customFolder.trim() || folder;
    const newResults = [];

    for (const { file } of files) {
      const originalSize = file.size;
      let blob: Blob = file;
      let compressed = false;

      if (file.size > MAX_BYTES) {
        blob = await compressToLimit(file, MAX_BYTES);
        compressed = true;
      }

      const ext = compressed ? 'jpg' : file.name.split('.').pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `${target}/${name}`;
      const kb = (blob.size / 1024).toFixed(0);
      const origKb = (originalSize / 1024).toFixed(0);

      const formData = new FormData();
      formData.append('file', new File([blob], name, { type: compressed ? 'image/jpeg' : file.type }));
      formData.append('path', path);

      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const json = await res.json();

      if (!res.ok) {
        newResults.push({ name: file.name, url: `Ошибка: ${json.error}`, size: '', compressed });
      } else {
        newResults.push({
          name: file.name,
          url: json.url,
          size: compressed ? `${origKb} KB → ${kb} KB` : `${kb} KB`,
          compressed,
        });
      }
    }

    setResults(newResults);
    setFiles([]);
    setUploading(false);
  };

  const navStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 800, cursor: 'pointer', textDecoration: 'none', color: '#000' };

  return (
    <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '10px' }}>
      <div style={{ fontWeight: 800, fontSize: '18px', textTransform: 'lowercase' }}>загрузка изображений</div>

      {/* Delivery toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '2px solid #000', background: deliveryEnabled ? '#000' : '#fff' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 800, fontSize: '13px', textTransform: 'lowercase', color: deliveryEnabled ? '#fff' : '#000' }}>
            стоимость доставки в заказах
          </span>
          <span style={{ fontSize: '11px', color: deliveryEnabled ? '#ccc' : '#888' }}>
            {deliveryEnabled ? 'включена — покупатели платят за доставку' : 'выключена — доставка бесплатно (тест)'}
          </span>
        </div>
        <button
          onClick={toggleDelivery}
          disabled={toggling || deliveryEnabled === null}
          style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '13px', padding: '8px 14px', border: `2px solid ${deliveryEnabled ? '#fff' : '#000'}`, background: 'transparent', color: deliveryEnabled ? '#fff' : '#000', cursor: 'pointer', textTransform: 'lowercase' }}
        >
          {toggling ? '...' : deliveryEnabled ? '[выключить]' : '[включить]'}
        </button>
      </div>

      {/* Folder selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontWeight: 800, fontSize: '13px', textTransform: 'lowercase' }}>папка в storage:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {FOLDERS.map(f => (
            <button key={f} onClick={() => setFolder(f)} style={{ fontFamily: 'inherit', fontSize: '13px', fontWeight: 800, padding: '4px 10px', border: '1.5px solid #000', background: folder === f ? '#000' : '#fff', color: folder === f ? '#fff' : '#000', cursor: 'pointer', textTransform: 'lowercase' }}>
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="или введи свою папку: cases/новый-кейс"
          value={customFolder}
          onChange={e => setCustomFolder(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#000' : '#ccc'}`, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '14px', textTransform: 'lowercase', transition: 'border-color 0.15s', background: dragging ? '#f5f5f5' : '#fff' }}
      >
        перетащи фото сюда или нажми чтобы выбрать
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
      </div>

      {/* Preview */}
      {files.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {files.map(({ file, preview }, i) => (
            <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
              <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
              {file.size > MAX_BYTES && (
                <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(255,150,0,0.85)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 4px' }}>сожмётся</div>
              )}
              <div onClick={() => removeFile(i)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '12px', fontWeight: 800, padding: '2px 5px', cursor: 'pointer' }}>[×]</div>
              <div style={{ fontSize: '10px', fontWeight: 500, marginTop: '2px', textAlign: 'center' }}>{(file.size / 1024).toFixed(0)} KB</div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <button onClick={upload} disabled={uploading} style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '15px', padding: '12px', border: '2px solid #000', background: uploading ? '#f5f5f5' : '#000', color: uploading ? '#999' : '#fff', cursor: uploading ? 'not-allowed' : 'pointer', textTransform: 'lowercase' }}>
          {uploading ? 'загружаю...' : `[загрузить ${files.length} фото]`}
        </button>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontWeight: 800, fontSize: '13px', textTransform: 'lowercase' }}>готово — скопируй url:</div>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px', border: '1px solid #e0e0e0', background: '#fafafa' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, display: 'flex', justifyContent: 'space-between' }}>
                <span>{r.name}</span>
                <span style={{ color: r.compressed ? '#e65c00' : '#666' }}>{r.size}{r.compressed ? ' ✓ сжато' : ''}</span>
              </div>
              <div
                onClick={() => navigator.clipboard.writeText(r.url)}
                style={{ fontSize: '12px', fontWeight: 500, wordBreak: 'break-all', cursor: 'pointer', padding: '6px 8px', background: '#fff', border: '1px solid #ddd' }}
                title="нажми чтобы скопировать"
              >
                {r.url}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>нажми на url чтобы скопировать</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
