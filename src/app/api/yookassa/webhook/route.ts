import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const escapeHtml = (t: string) =>
  String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Нас интересует только успешная оплата
    if (body.event !== 'payment.succeeded') {
      return NextResponse.json({ ok: true });
    }

    const payment = body.object;
    const meta: Record<string, string> = payment.metadata ?? {};

    // Верифицируем платёж напрямую через API ЮKassa (защита от фейковых вебхуков)
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (shopId && secretKey) {
      const verifyRes = await fetch(`https://api.yookassa.ru/v3/payments/${payment.id}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        },
      });
      const verified = await verifyRes.json();
      if (verified.status !== 'succeeded') {
        return NextResponse.json({ ok: true });
      }
    }

    // Восстанавливаем данные заказа из metadata
    const items = JSON.parse(meta.order_items ?? '[]');
    const deliveryCost = Number(meta.order_delivery_cost ?? 0);

    // Отправляем уведомление в Telegram
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const itemsList = items
        .map((i: any) => `- ${escapeHtml(String(i.name))} (р.${i.size}) x${i.quantity} = ${i.price * i.quantity}₽`)
        .join('\n');

      const message = `
💳 <b>ОПЛАЧЕН ЗАКАЗ!</b>
🆔 <b>Платёж:</b> <code>${payment.id}</code>
👤 <b>ФИО:</b> ${escapeHtml(meta.order_name)}
📧 <b>Email:</b> ${escapeHtml(meta.order_email)}
📞 <b>Телефон:</b> ${escapeHtml(meta.order_phone)}
✈️ <b>TG:</b> ${escapeHtml(meta.order_tg)}
🏙 <b>Город:</b> ${escapeHtml(meta.order_city)}
🚚 <b>Служба:</b> ${escapeHtml(meta.order_delivery)}
📍 <b>ПВЗ:</b> ${escapeHtml(meta.order_address)}

🛒 <b>Корзина:</b>
${itemsList}

🚚 <b>Доставка:</b> ${deliveryCost > 0 ? deliveryCost + '₽' : 'не рассчитана'}
💰 <b>ИТОГО ОПЛАЧЕНО:</b> ${payment.amount?.value}₽`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });
    }

    // Декремент склада в product_variants
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && (serviceKey || anonKey)) {
      const supabase = createClient(supabaseUrl, serviceKey || anonKey!, {
        auth: { persistSession: false },
      });

      for (const item of items) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('id, stock, to_produce')
          .eq('product_id', Number(item.id))
          .eq('attribute_value', String(item.size))
          .single();

        if (!variant) continue;

        const available = variant.stock ?? 0;
        const qty = item.quantity;
        const deficit = qty - available;

        await supabase
          .from('product_variants')
          .update({
            stock: Math.max(0, available - qty),
            to_produce: deficit > 0 ? (variant.to_produce ?? 0) + deficit : (variant.to_produce ?? 0),
          })
          .eq('id', variant.id);
      }
    }

    revalidatePath('/products');
    revalidatePath('/products/[slug]', 'page');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    // Всегда 200 — иначе ЮKassa будет повторять запрос
    return NextResponse.json({ ok: true });
  }
}
