import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isRateLimited, getClientIp } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    if (isRateLimited(`order:${getClientIp(req)}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'слишком много попыток оформить заказ, попробуйте позже' }, { status: 429 });
    }

    const { orderData } = await req.json();

    // Honeypot: скрытое поле, которое реальный пользователь никогда не заполнит
    if (String(orderData?.website ?? '').trim()) {
      return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 400 });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return NextResponse.json({ error: 'YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не заданы в Vercel' }, { status: 500 });
    }

    // Derive origin from the incoming request so return_url is always correct
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

    // Check if delivery cost is enabled
    const settingsRes = await fetch(`${siteUrl}/api/admin/settings`).catch(() => null);
    const settings = settingsRes?.ok ? await settingsRes.json() : {};
    const deliveryEnabled = settings.delivery_enabled !== 'false';
    const effectiveDeliveryCost = deliveryEnabled ? (orderData.deliveryCost ?? 0) : 0;

    const totalAmount = (orderData.total + effectiveDeliveryCost).toFixed(2);

    const description = orderData.items
      .map((i: any) => `${i.name} р.${i.size} x${i.quantity}`)
      .join(', ')
      .substring(0, 128);

    // All order data goes into metadata — webhook reads it on payment.succeeded
    const metadata: Record<string, string> = {
      order_name:          String(orderData.name ?? '').substring(0, 200),
      order_email:         String(orderData.email ?? '').substring(0, 200),
      order_phone:         String(orderData.phone ?? '').substring(0, 100),
      order_tg:            String(orderData.tg ?? '').substring(0, 100),
      order_city:          String(orderData.city ?? '').substring(0, 100),
      order_delivery:      String(orderData.delivery ?? '').substring(0, 100),
      order_address:       String(orderData.address ?? '').substring(0, 500),
      order_delivery_cost: String(effectiveDeliveryCost),
      order_items:         JSON.stringify(orderData.items ?? []).substring(0, 1024),
    };

    const res = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': randomUUID(),
        'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: { value: totalAmount, currency: 'RUB' },
        confirmation: {
          type: 'redirect',
          return_url: `${siteUrl}/order/success?tg=${encodeURIComponent(String(orderData.tg ?? ''))}`,
        },
        description,
        capture: true,
        metadata,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('YooKassa create-payment error:', data);
      return NextResponse.json({ error: data.description ?? 'Ошибка создания платежа' }, { status: 400 });
    }

    return NextResponse.json({
      confirmation_url: data.confirmation.confirmation_url,
      payment_id: data.id,
    });
  } catch (err: any) {
    console.error('create-payment crash:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
