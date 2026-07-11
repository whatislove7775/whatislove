export default function Loading() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '20px', width: '220px', background: '#eee', marginBottom: '40px' }} />
      <div className="product-page-layout">
        <div style={{ position: 'relative', width: '450px', maxWidth: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden', flexShrink: 0 }}>
          <div className="img-skeleton" />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
          <div style={{ height: '22px', width: '60%', background: '#eee' }} />
          <div style={{ height: '16px', width: '30%', background: '#eee' }} />
          <div style={{ height: '14px', width: '90%', background: '#eee' }} />
          <div style={{ height: '14px', width: '80%', background: '#eee' }} />
        </div>
      </div>
    </div>
  );
}
