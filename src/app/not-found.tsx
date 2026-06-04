import DuckGame from '@/components/DuckGame';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      textAlign: 'center',
      textTransform: 'uppercase',
      paddingTop: '20px',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <img src="/404.svg" alt="nice try" className="desktop-only" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
        <img src="/nicetry.svg" alt="nice try" className="mobile-only" style={{ width: '100%', maxWidth: '320px', height: 'auto' }} />
      </div>

      <div style={{ fontWeight: 700, fontSize: '16px' }}>
        ⚠ ОШИБКА 404 ⚠<br/>
        СТРАНИЦА НЕ НАЙДЕНА
      </div>

      <div style={{ marginTop: '14px', fontWeight: 700, fontSize: '12px', color: '#888', textTransform: 'none' }}>
        раз уж вы здесь — поиграйте в утку 🦆
      </div>

      {/* Полноценная игра прямо на странице 404 */}
      <div style={{ width: '100%', marginTop: '20px' }}>
        <DuckGame showHomeLink={false} />
      </div>

      <a href="/" style={{ marginTop: '10px', fontWeight: 700, fontSize: '14px' }}>
         [ ВЕРНУТЬСЯ НА ГЛАВНУЮ ]
      </a>
    </div>
  );
}
