'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function LinksPage() {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* Оборачиваем Breadcrumbs в div с боковыми отступами для выравнивания с футером */}
      <div style={{ padding: '20px 100px 0 100px', width: '100%', boxSizing: 'border-box' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'LINK^S', icon: '🔗' }
        ]} />
      </div>
      
      {/* Контейнер для центрирования посередине экрана */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '-60px' }}>
        
        <img src="/me.svg" alt="@me" style={{ width: '100%', maxWidth: '350px', marginBottom: '60px' }} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>[КАНАЛ В ТГ]</span>
            <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer">T.ME/WHATISLOVE_R</a>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>[АВТОР В ТГ]</span>
            <a href="https://t.me/babydonthurtmovich" target="_blank" rel="noopener noreferrer">T.ME/BABYDONTHURTMOVICH</a>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>[ПОЧТА]</span>
            <a href="mailto:babydonthurtmovich@mail.ru" target="_blank" rel="noopener noreferrer">BABYDONTHURTMOVICH@MAIL.RU</a>
          </div>
        </div>
      </div>
    </div>
  );
}
