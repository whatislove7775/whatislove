'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function PrivacyPage() {
  return (
    <div style={{ width: '100%', maxWidth: '800px', padding: '20px' }}>
      <Breadcrumbs path={[
        { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
        { name: 'КОНФИДЕНЦИАЛЬНОСТЬ', icon: '🔒' }
      ]} />
      <div style={{ marginTop: '60px', lineHeight: '1.6' }}>
        <h1 style={{ fontWeight: 800, textTransform: 'uppercase', marginBottom: '20px' }}>Политика конфиденциальности</h1>
        <p>Здесь должен быть текст о том, как ты обрабатываешь данные пользователей (email, телефоны)...</p>
      </div>
    </div>
  );
}
