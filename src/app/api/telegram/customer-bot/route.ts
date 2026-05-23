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
  return raw.replace(/^@/, '').toLowerCase().trim();
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
      await send(chatId, 'Привет! 👋\n\nЧтобы получить подтверждение заказа, установи username в настройках Telegram и нажми кнопку ещё раз.');
      return NextResponse.json({ ok: true });
    }

    const supabase = db();
    const tgNorm = normalizeTg(rawUsername);

    const { data: notifications } = await supabase
      .from('order_notifications')
      .select('*')
      .eq('sent', false)
      .order('created_at', { ascending: false });

    const notification = (notifications ?? []).find(
      (n: any) => normalizeTg(n.tg_username ?? '') === tgNorm
    );

    if (notification) {
      const o = notification.order_data;
      const items = (o.items ?? [])
        .map((i: any) => `• ${i.name} (р.${i.size}) x${i.quantity} — ${i.price * i.quantity}₽`)
        .join('\n');

      const text =
        `✅ <b>Заказ подтверждён!</b>\n\n` +
        `🛒 <b>Состав:</b>\n${items}\n\n` +
        `🏙 <b>Город:</b> ${o.city}\n` +
        `📍 <b>Адрес:</b> ${o.address}\n` +
        `🚚 <b>Доставка:</b> ${o.delivery} — ${o.deliveryCost}₽\n` +
        `💰 <b>Итого оплачено:</b> ${o.totalPaid}₽\n\n` +
        `Скоро свяжемся с тобой! 🤍`;

      await send(chatId, text);
      await supabase
        .from('order_notifications')
        .update({ sent: true, customer_chat_id: chatId })
        .eq('id', notification.id);
    } else {
      await send(
        chatId,
        'Привет! 👋\n\nЗдесь ты получишь подтверждение заказа с <b>wh4tislove.ru</b> сразу после оплаты.\n\nЕсли ты только что заплатил — напиши снова через минуту.'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[customer-bot]', err);
    return NextResponse.json({ ok: true });
  }
}
