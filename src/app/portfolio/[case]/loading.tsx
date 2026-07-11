export default function Loading() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '20px', width: '220px', background: '#eee', marginBottom: '40px' }} />
      <div style={{ display: 'flex', gap: '40px', width: '100%', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 500px', aspectRatio: '16/10', backgroundColor: '#000', overflow: 'hidden' }}>
          <div className="img-skeleton" />
        </div>
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
          <div style={{ height: '22px', width: '70%', background: '#eee' }} />
          <div style={{ height: '14px', width: '90%', background: '#eee' }} />
          <div style={{ height: '14px', width: '80%', background: '#eee' }} />
          <div style={{ height: '14px', width: '60%', background: '#eee' }} />
        </div>
      </div>
    </div>
  );
}
