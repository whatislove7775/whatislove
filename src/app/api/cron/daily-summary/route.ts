import { NextResponse } from 'next/server';

export const maxDuration = 30;

function escapeHtml(t: string) {
  return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET(req: Request) {
  // Protect the cron endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!shopId || !secretKey || !token || !chatId) {
    console.error('[daily-summary] missing env vars');
    return NextResponse.json({ error: 'missing env vars' }, { status: 500 });
  }

  // Today's range in UTC (Moscow = UTC+3, so 21:00 MSK = 18:00 UTC)
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);

  const from = todayStart.toISOString().replace('.000Z', '+00:00');
  const to = todayEnd.toISOString().replace('.999Z', '+00:00');

  // Fetch succeeded payments from YooKassa for today
  const url = `https://api.yookassa.ru/v3/payments?status=succeeded&created_at.gte=${encodeURIComponent(from)}&created_at.lte=${encodeURIComponent(to)}&limit=100`;

  const ykRes = await fetch(url, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
    },
  });

  if (!ykRes.ok) {
    const err = await ykRes.json();
    console.error('[daily-summary] YooKassa error:', err);
    return NextResponse.json({ error: 'YooKassa API error' }, { status: 500 });
  }

  const ykData = await ykRes.json();
  const payments: any[] = ykData.items ?? [];
  const total = payments.reduce((sum: number, p: any) => sum + parseFloat(p.amount?.value ?? '0'), 0);

  const dateStr = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Moscow' });

  let orderLines = '';
  if (payments.length === 0) {
    orderLines = 'нет оплаченных заказов сегодня';
  } else {
    orderLines = payments.map((p, i) => {
      const meta = p.metadata ?? {};
      const name = escapeHtml(meta.order_name || '—');
      const tg = escapeHtml(meta.order_tg || '—');
      const items = (() => {
        try {
          return (JSON.parse(meta.order_items || '[]') as any[])
            .map((it: any) => `${it.name} р.${it.size} x${it.quantity}`)
            .join(', ');
        } catch { return '—'; }
      })();
      return `${i + 1}. ${name} (${tg}) — ${items} — <b>${p.amount?.value}₽</b>`;
    }).join('\n');
  }

  const message = `📊 <b>Сводка за ${dateStr}</b>

Оплачено заказов: <b>${payments.length}</b>
Сумма: <b>${total.toFixed(0)}₽</b>

${orderLines}`;

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });

  const tgData = await tgRes.json();
  if (!tgData.ok) {
    console.error('[daily-summary] Telegram error:', JSON.stringify(tgData));
    return NextResponse.json({ error: 'Telegram error', detail: tgData }, { status: 500 });
  }

  console.log(`[daily-summary] sent: ${payments.length} orders, ${total.toFixed(0)}₽`);
  return NextResponse.json({ ok: true, orders: payments.length, total: total.toFixed(0) });
}
