import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.CUSTOMER_BOT_TOKEN!;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function send(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
}

function normalizeTg(raw: string): string {
  return (raw ?? '').replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, '').toLowerCase().trim();
}

function buildOrderText(o: any): string {
  const items = (o.items ?? [])
    .map((i: any) => `• ${i.name} (р.${i.size}) x${i.quantity} — ${i.price * i.quantity}₽`)
    .join('\n');
  return (
    `✅ <b>Заказ подтверждён!</b>\n\n` +
    `🛒 <b>Состав:</b>\n${items}\n\n` +
    `🏙 <b>Город:</b> ${o.city}\n` +
    `📍 <b>Адрес:</b> ${o.address}\n` +
    `🚚 <b>Доставка:</b> ${o.delivery} — ${o.deliveryCost}₽\n` +
    `💰 <b>Итого оплачено:</b> ${o.totalPaid}₽\n\n` +
    `Скоро свяжемся с тобой! 🤍`
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;
    if (!message?.text) return NextResponse.json({ ok: true });

    const chatId: number = message.chat.id;
    const rawUsername: string = message.from?.username ?? '';

    if (!message.text.startsWith('/start')) return NextResponse.json({ ok: true });

    if (!rawUsername) {
      await send(chatId, 'Привет! 👋\n\nЧтобы получить подтверждение заказа, установи username в настройках Telegram и нажми /start ещё раз.');
      return NextResponse.json({ ok: true });
    }

    const supabase = db();
    const tgNorm = normalizeTg(rawUsername);

    // Сохраняем chat_id — чтобы слать уведомления сразу при оплате
    await supabase
      .from('order_notifications')
      .update({ customer_chat_id: chatId })
      .or(`tg_username.eq.${tgNorm},tg_username.eq.@${tgNorm}`)
      .eq('sent', false);

    // Ищем заказ: по tg_username ИЛИ по order_data->tg, без фильтра sent
    const { data: all } = await supabase
      .from('order_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const notification = (all ?? []).find((n: any) => {
      const byColumn = normalizeTg(n.tg_username ?? '') === tgNorm;
      const byData = normalizeTg(n.order_data?.tg ?? '') === tgNorm;
      return byColumn || byData;
    });

    if (notification) {
      await send(chatId, buildOrderText(notification.order_data));
      await supabase
        .from('order_notifications')
        .update({ sent: true, customer_chat_id: chatId })
        .eq('id', notification.id);
    } else {
      await send(
        chatId,
        'Привет! 👋\n\nЗдесь ты получишь подтверждение заказа с <b>wh4tislove.ru</b> сразу после оплаты.\n\nЕсли ты только что заплатил — напиши /start через минуту.'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[customer-bot]', err);
    return NextResponse.json({ ok: true });
  }
}
