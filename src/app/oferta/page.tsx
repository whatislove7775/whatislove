'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function OfertaPage() {
  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'ОФЕРТА', icon: '📄' }
      ]} />
      <div style={{ marginTop: '60px', lineHeight: '1.6' }}>
        <h1 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>Публичная оферта</h1>
        <p>Здесь должен быть юридический текст о правилах покупки в твоем магазине...</p>
      </div>
    </div>
  );
}
