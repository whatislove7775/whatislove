import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

async function send(chatId: number, text: string): Promise<boolean> {
  const token = process.env.CUSTOMER_BOT_TOKEN;
  if (!token) {
    console.error('[customer-bot] CUSTOMER_BOT_TOKEN not set');
    return false;
  }
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });
  const data = await res.json();
  if (!data.ok) console.error('[customer-bot] sendMessage failed:', JSON.stringify(data));
  return data.ok === true;
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

    // Сохраняем chat_id для этого пользователя (чтобы слать сразу при оплате)
    const { data: myOrders } = await supabase
      .from('order_notifications')
      .select('id, tg_username, order_data, sent')
      .order('created_at', { ascending: false })
      .limit(200);

    const notification = (myOrders ?? []).find((n: any) => {
      return normalizeTg(n.tg_username ?? '') === tgNorm ||
             normalizeTg(n.order_data?.tg ?? '') === tgNorm;
    });

    if (notification) {
      const ok = await send(chatId, buildOrderText(notification.order_data));
      if (ok) {
        await supabase
          .from('order_notifications')
          .update({ sent: true, customer_chat_id: chatId })
          .eq('id', notification.id);
      }
    } else {
      // Сохраняем chat_id даже без заказа — пригодится когда оплата придёт позже
      await supabase.from('tg_chat_ids').upsert(
        { tg_username: tgNorm, chat_id: chatId },
        { onConflict: 'tg_username' }
      ).then(() => {}); // таблица может не существовать — не критично

      await send(
        chatId,
        'Привет! 👋\n\nЗдесь ты получишь подтверждение заказа с <b>wh4tislove.ru</b> сразу после оплаты.\n\nЕсли ты только что заплатил — напиши /start через минуту.'
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[customer-bot] error:', err);
    return NextResponse.json({ ok: true });
  }
}
