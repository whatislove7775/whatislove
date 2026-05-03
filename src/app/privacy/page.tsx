import Breadcrumbs from '@/components/Breadcrumbs';

export default function OfertaPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <Breadcrumbs path={[{ name: 'ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ', icon: '📄' }]} />
      </div>
      <div style={{ width: '100%', maxWidth: '800px', marginTop: '40px', fontWeight: 500, lineHeight: 1.6 }}>
        <h1 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>Публичная Оферта</h1>
        <p>Здесь будет текст твоей оферты...</p>
      </div>
    </div>
  );
}
