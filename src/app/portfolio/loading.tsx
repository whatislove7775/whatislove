export default function Loading() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '20px', width: '180px', background: '#eee', marginBottom: '30px' }} />
      <div className="portfolio-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative', width: '240px', flexShrink: 0, aspectRatio: '16/10', backgroundColor: '#000', overflow: 'hidden' }}>
              <div className="img-skeleton" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, paddingTop: '10px' }}>
              <div style={{ height: '16px', width: '80%', background: '#eee' }} />
              <div style={{ height: '13px', width: '95%', background: '#eee' }} />
              <div style={{ height: '13px', width: '60%', background: '#eee' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
