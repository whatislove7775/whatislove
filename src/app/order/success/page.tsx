'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

function SuccessContent() {
  const clearCart = useCartStore((s: any) => s.clearCart);
  const params = useSearchParams();
  const tg = params.get('tg') ?? '';

  useEffect(() => { clearCart(); }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', paddingTop: '60px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '48px' }}>✓</div>
      <div style={{ fontWeight: 800, fontSize: '20px', textTransform: 'lowercase' }}>заказ оплачен!</div>
      <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
        спасибо — твой заказ принят и скоро будет обработан
        {tg && <><br />свяжемся с тобой в telegram: <b>{tg}</b></>}
      </div>

      <a
        href="https://t.me/wh4tislove_orders_bot"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', padding: '14px 24px', background: '#000', color: '#fff', fontWeight: 800, fontSize: '14px', textDecoration: 'none', textTransform: 'lowercase', width: '100%', boxSizing: 'border-box' }}
      >
        получить подтверждение в telegram →
      </a>

      <div style={{ fontSize: '12px', color: '#888', lineHeight: 1.5 }}>
        нажми кнопку → запусти бота → он пришлёт детали заказа
      </div>

      <Link href="/products" style={{ fontSize: '14px', fontWeight: 800, color: '#000', textDecoration: 'none', textTransform: 'lowercase' }}>
        [вернуться к каталогу]
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
