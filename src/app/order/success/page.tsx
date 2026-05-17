import Link from 'next/link';

export default function OrderSuccessPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '70vh',
      width: '100%',
      textAlign: 'center',
      fontFamily: 'inherit',
    }}>
      <h1 style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '24px', margin: 0 }}>
        ОПЛАТА ПРОШЛА! &lt;3
      </h1>
      <p style={{ fontWeight: 500, marginTop: '20px', maxWidth: '380px', lineHeight: 1.7, fontSize: '14px' }}>
        Заказ оформлен и оплачен.<br />
        Мы свяжемся с тобой в Telegram для подтверждения деталей и отправки кольца.
      </p>
      <Link href="/products" style={{ marginTop: '40px', fontWeight: 800, color: '#000', fontSize: '14px' }}>
        [ вернуться в магазин ]
      </Link>
    </div>
  );
}
