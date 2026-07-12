'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { adminFetch } from '@/lib/adminFetch';

function ah() { return { 'x-admin-key': localStorage.getItem('admin_key') ?? '' }; }
function ahJson() { return { ...ah(), 'Content-Type': 'application/json' }; }

const FOLDERS = ['products', 'cases/asiya-site', 'cases/asiya-merch', 'cases/snappy-silk-site', 'cases/egor-kreed-ring'];
const MAX_BYTES = 1 * 1024 * 1024;

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
      let lo = 0.1, hi = 0.95, bestBlob: Blob | null = null;
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
      try_(hi, blob => { if (blob.size <= maxBytes) { resolve(blob); return; } bestBlob = blob; step(lo, hi, 0); });
    };
    img.onerror = reject; img.src = url;
  });
}

type StoredFile = { name: string; path: string; url: string; size: number };

export default function AdminUploadPage() {
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [customFolder, setCustomFolder] = useState('');
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [loadingStored, setLoadingStored] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const activeFolder = customFolder.trim() || folder;

  const loadStored = useCallback((f: string) => {
    setLoadingStored(true);
    setStoredFiles([]);
    adminFetch(`/api/admin/storage?folder=${encodeURIComponent(f)}`, { headers: ah() })
      .then(r => r.json())
      .then(d => { setStoredFiles(Array.isArray(d) ? d : []); setLoadingStored(false); });
  }, []);

  useEffect(() => { loadStored(activeFolder); }, [activeFolder, loadStored]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    setPendingFiles(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files);
  }, []);

  const upload = async () => {
    if (!pendingFiles.length) return;
    setUploading(true);
    for (const { file } of pendingFiles) {
      let blob: Blob = file;
      let compressed = false;
      if (file.size > MAX_BYTES) { blob = await compressToLimit(file, MAX_BYTES); compressed = true; }
      const ext = compressed ? 'jpg' : file.name.split('.').pop();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const formData = new FormData();
      formData.append('file', new File([blob], name, { type: compressed ? 'image/jpeg' : file.type }));
      formData.append('path', `${activeFolder}/${name}`);
      await adminFetch('/api/upload-image', { method: 'POST', headers: ah(), body: formData });
    }
    setPendingFiles([]);
    setUploading(false);
    loadStored(activeFolder);
  };

  const del = async (path: string) => {
    if (!confirm('удалить фото?')) return;
    setDeleting(path);
    await adminFetch('/api/admin/storage', { method: 'DELETE', headers: ahJson(), body: JSON.stringify({ path }) });
    setDeleting(null);
    setStoredFiles(f => f.filter(x => x.path !== path));
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div style={{ fontWeight: 800, fontSize: '18px' }}>фото</div>

      {/* Folder tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {FOLDERS.map(f => (
          <button key={f} onClick={() => { setFolder(f); setCustomFolder(''); }}
            style={{ fontFamily: 'inherit', fontSize: '12px', fontWeight: 800, padding: '5px 12px', border: '1.5px solid #000', background: activeFolder === f ? '#000' : '#fff', color: activeFolder === f ? '#fff' : '#000', cursor: 'pointer' }}>
            {f}
          </button>
        ))}
        <input
          type="text"
          placeholder="своя папка..."
          value={customFolder}
          onChange={e => setCustomFolder(e.target.value)}
          style={{ padding: '5px 10px', border: '1.5px solid #ccc', fontFamily: 'inherit', fontSize: '12px', outline: 'none', width: '160px' }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? '#000' : '#ccc'}`, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', fontWeight: 800, fontSize: '13px', background: dragging ? '#f5f5f5' : '#fff' }}
      >
        перетащи фото или нажми — загрузится в «{activeFolder}»
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }} />
      </div>

      {/* Pending previews */}
      {pendingFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {pendingFiles.map(({ file, preview }, i) => (
              <div key={i} style={{ position: 'relative', width: '80px' }}>
                <img src={preview} style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }} alt="" />
                {file.size > MAX_BYTES && <div style={{ position: 'absolute', top: 0, left: 0, background: 'rgba(255,140,0,0.9)', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 4px' }}>сожмётся</div>}
                <div onClick={() => setPendingFiles(f => f.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '14px', fontWeight: 800, padding: '1px 5px', cursor: 'pointer' }}>×</div>
              </div>
            ))}
          </div>
          <button onClick={upload} disabled={uploading}
            style={{ fontFamily: 'inherit', fontWeight: 800, fontSize: '14px', padding: '10px 24px', border: '2px solid #000', background: uploading ? '#f0f0f0' : '#000', color: uploading ? '#999' : '#fff', cursor: uploading ? 'default' : 'pointer', alignSelf: 'flex-start' }}>
            {uploading ? 'загружаю...' : `загрузить ${pendingFiles.length} фото`}
          </button>
        </div>
      )}

      {/* Stored files */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontWeight: 800, fontSize: '13px', color: '#888' }}>
          {loadingStored ? 'загрузка...' : `в папке «${activeFolder}»: ${storedFiles.length} фото`}
        </div>

        {storedFiles.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
            {storedFiles.map(f => (
              <div key={f.path} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ position: 'relative', aspectRatio: '1', background: '#f0f0f0' }}>
                  <img src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" loading="lazy" />
                  <button
                    onClick={() => del(f.path)}
                    disabled={deleting === f.path}
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(180,0,0,0.85)', color: '#fff', border: 'none', fontFamily: 'inherit', fontWeight: 800, fontSize: '12px', padding: '2px 7px', cursor: 'pointer' }}
                  >
                    {deleting === f.path ? '...' : '×'}
                  </button>
                </div>
                <div
                  onClick={() => copy(f.url)}
                  title="скопировать url"
                  style={{ fontSize: '10px', color: copied === f.url ? '#090' : '#0066cc', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}
                >
                  {copied === f.url ? '✓ скопировано' : f.name}
                </div>
                <div style={{ fontSize: '10px', color: '#aaa' }}>{f.size ? `${(f.size / 1024).toFixed(0)} KB` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {!loadingStored && storedFiles.length === 0 && (
          <div style={{ color: '#aaa', fontSize: '13px' }}>папка пустая</div>
        )}
      </div>
    </div>
  );
}
