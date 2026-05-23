'use client';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function LinksPage() {
  return (
    // 1. Добавляем width: '100%' главному контейнеру
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
      
      {/* 2. Оборачиваем навигацию точно так же, как на других страницах */}
      <div style={{ width: '100%', alignSelf: 'flex-start' }}>
        <Breadcrumbs path={[
          { name: 'WH4T!SLOV3', href: '/', icon: '📁' },
          { name: 'ССЫЛКИ', icon: '🔗' }
        ]} />
      </div>
      
      {/* Контейнер для центрирования посередине экрана */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '-60px' }}>
        
        <img src="/me.svg" alt="@me" style={{ width: '100%', maxWidth: '350px', marginBottom: '60px' }} />

        <div className="links-nav" style={{ display: 'flex', justifyContent: 'center', gap: '40px', fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>
          <div className="links-nav-item" style={{ display: 'flex', gap: '10px' }}>
            <span>[КАНАЛ В ТГ]</span>
            <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer">t.me/whatislove_r</a>
          </div>
          <div className="links-nav-item" style={{ display: 'flex', gap: '10px' }}>
            <span>[АВТОР В ТГ]</span>
            <a href="https://t.me/babydonthurtmovich" target="_blank" rel="noopener noreferrer">t.me/babydonthurtmovich</a>
          </div>
          <div className="links-nav-item" style={{ display: 'flex', gap: '10px' }}>
            <span>[ПОЧТА]</span>
            <a href="mailto:babydonthurtmovich@mail.ru" target="_blank" rel="noopener noreferrer">babydonthurtmovich@mail.ru</a>
          </div>
        </div>
      </div>
    </div>
  );
}
