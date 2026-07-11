export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ height: '20px', width: '160px', background: '#eee', marginBottom: '40px' }} />
      <div className="products-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', backgroundColor: '#e5e5e5', overflow: 'hidden' }}>
              <div className="img-skeleton" />
            </div>
            <div style={{ height: '16px', width: '70%', background: '#eee' }} />
            <div style={{ height: '14px', width: '40%', background: '#eee' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
