export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '70vh', 
      textAlign: 'center',
      width: '100%',
      textTransform: 'uppercase'
    }}>
      {/* SVG nice try вместо текста */}
      <div style={{ marginBottom: '30px' }}>
        <img src="/404.svg" alt="nice try" style={{ width: '100%', maxWidth: '400px', height: 'auto' }} />
      </div>

      <div style={{ fontWeight: 700, fontSize: '16px' }}>
        ⚠ ОШИБКА 404 ⚠<br/>
        СТРАНИЦА НЕ НАЙДЕНА
      </div>
      <a href="/" style={{ marginTop: '30px', fontWeight: 700, fontSize: '14px' }}>
         [ ВЕРНУТЬСЯ НА ГЛАВНУЮ ]
      </a>
    </div>
  );
}
