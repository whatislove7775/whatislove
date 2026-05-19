import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const escapeHtml = (t: string) =>
  String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function notifyTelegram(orderData: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('[create-payment] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return;
  }
  const itemsList = (orderData.items || [])
    .map((i: any) => `- ${escapeHtml(String(i.name))} (р.${i.size}) x${i.quantity} = ${i.price * i.quantity}₽`)
    .join('\n');
  const message = `📦 <b>НОВЫЙ ЗАКАЗ!</b>
👤 <b>ФИО:</b> ${escapeHtml(orderData.name)}
📧 <b>Email:</b> ${escapeHtml(orderData.email)}
📞 <b>Телефон:</b> ${escapeHtml(orderData.phone)}
✈️ <b>TG:</b> ${escapeHtml(orderData.tg)}
🏙 <b>Город:</b> ${escapeHtml(orderData.city)}
🚚 <b>Служба:</b> ${escapeHtml(orderData.delivery)}
📍 <b>ПВЗ:</b> ${escapeHtml(orderData.address)}

🛒 <b>Корзина:</b>
${itemsList}

🚚 <b>Доставка:</b> ${orderData.deliveryCost > 0 ? orderData.deliveryCost + '₽' : 'не рассчитана'}
💰 <b>ИТОГО:</b> ${(orderData.total || 0) + (orderData.deliveryCost || 0)}₽`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('[create-payment] Telegram error:', JSON.stringify(data));
  } else {
    console.log('[create-payment] Telegram notification sent OK');
  }
}

async function decrementStock(items: any[]) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('[create-payment] SUPABASE vars not set — stock NOT updated');
    return;
  }
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  for (const item of items) {
    const { data: variant, error } = await supabase
      .from('product_variants')
      .select('id, stock, to_produce')
      .eq('product_id', item.id)
      .eq('attribute_value', String(item.size))
      .single();
    if (error || !variant) {
      console.error(`[create-payment] variant not found: product_id=${item.id} size=${item.size}`);
      continue;
    }
    const currentStock: number = variant.stock ?? 0;
    const qty: number = item.quantity;
    const newStock = Math.max(0, currentStock - qty);
    const deficit = qty - currentStock;
    const newToProduce = deficit > 0 ? (variant.to_produce ?? 0) + deficit : (variant.to_produce ?? 0);
    const { error: upErr } = await supabase
      .from('product_variants')
      .update({ stock: newStock, to_produce: newToProduce })
      .eq('id', variant.id);
    if (upErr) {
      console.error(`[create-payment] stock update failed variant ${variant.id}:`, upErr.message);
    } else {
      console.log(`[create-payment] stock: variant=${variant.id} ${currentStock}→${newStock} to_produce→${newToProduce}`);
    }
  }
}

export async function POST(req: Request) {
  try {
    const { orderData } = await req.json();

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!shopId || !secretKey) {
      return NextResponse.json({ error: 'YOOKASSA_SHOP_ID или YOOKASSA_SECRET_KEY не заданы в Vercel' }, { status: 500 });
    }

    const totalAmount = (orderData.total + orderData.deliveryCost).toFixed(2);

    const description = orderData.items
      .map((i: any) => `${i.name} р.${i.size} x${i.quantity}`)
      .join(', ')
      .substring(0, 128);

    const metadata: Record<string, string> = {
      order_name:          String(orderData.name ?? '').substring(0, 200),
      order_email:         String(orderData.email ?? '').substring(0, 200),
      order_phone:         String(orderData.phone ?? '').substring(0, 100),
      order_tg:            String(orderData.tg ?? '').substring(0, 100),
      order_city:          String(orderData.city ?? '').substring(0, 100),
      order_delivery:      String(orderData.delivery ?? '').substring(0, 100),
      order_address:       String(orderData.address ?? '').substring(0, 500),
      order_delivery_cost: String(orderData.deliveryCost ?? 0),
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
          return_url: `${siteUrl}/order/success`,
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

    await Promise.all([
      notifyTelegram(orderData),
      decrementStock(orderData.items || []),
    ]);

    return NextResponse.json({
      confirmation_url: data.confirmation.confirmation_url,
      payment_id: data.id,
    });
  } catch (err: any) {
    console.error('create-payment crash:', err);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
