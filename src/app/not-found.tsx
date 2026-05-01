export default function NotFound() {
  return (
    <div style={{ textAlign: 'center' }}>
      <pre className="ascii-art" style={{ fontSize: '12px', marginBottom: '20px' }}>
{`
  _ __   _  ___ ___   | |_ _ __ _   _ 
 | '_ \\ | |/ __/ _ \\  | __| '__| | | |
 | | | || | (_|  __/  | |_| |  | |_| |
 |_| |_||_|\\___\\___|   \\__|_|   \\__, |
                                |___/ 
`}
      </pre>
      <div style={{ fontWeight: 'bold' }}>⚠ ОШИБКА 404 ⚠<br/>СТРАНИЦА НЕ НАЙДЕНА</div>
    </div>
  );
}
