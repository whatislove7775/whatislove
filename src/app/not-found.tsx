export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '60vh', 
      textAlign: 'center',
      width: '100%'
    }}>
      <pre style={{ fontSize: '10px', lineHeight: '1.2', marginBottom: '20px', fontWeight: 'bold' }}>
{`
  _ __   _  ___ ___   | |_ _ __ _   _ 
 | '_ \\ | |/ __/ _ \\  | __| '__| | | |
 | | | || | (_|  __/  | |_| |  | |_| |
 |_| |_||_|\\___\\___|   \\__|_|   \\__, |
                                |___/ 
`}
      </pre>
      <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase' }}>
        ⚠ ОШИБКА 404 ⚠<br/>
        СТРАНИЦА НЕ НАЙДЕНА
      </div>
      <a href="/" style={{ marginTop: '20px', fontWeight: 'bold' }}>[ ВЕРНУТЬСЯ НА ГЛАВНУЮ ]</a>
    </div>
  );
}
