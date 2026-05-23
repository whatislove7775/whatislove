import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const escapeHtml = (t: string) =>
  String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.event !== 'payment.succeeded') {
      return NextResponse.json({ ok: true });
    }

    const payment = body.object;
    const meta: Record<string, string> = payment.metadata ?? {};

    // Верификация платежа через API ЮKassa
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
        console.log(`[webhook] payment ${payment.id} status=${verified.status}, skipping`);
        return NextResponse.json({ ok: true });
      }
    } else {
      console.warn('[webhook] YOOKASSA_SHOP_ID or YOOKASSA_SECRET_KEY not set — skipping verification');
    }

    const items = JSON.parse(meta.order_items ?? '[]');
    const deliveryCost = Number(meta.order_delivery_cost ?? 0);

    // Telegram уведомление
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('[webhook] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set in Vercel env');
    } else {
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

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) {
        console.error('[webhook] Telegram sendMessage failed:', JSON.stringify(tgData));
      } else {
        console.log('[webhook] Telegram notification sent OK');
      }
    }

    // Обновление склада
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error('[webhook] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — stock NOT updated');
    } else {
      const supabase = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      });

      for (const item of items) {
        const { data: variant, error: selectError } = await supabase
          .from('product_variants')
          .select('id, stock, to_produce')
          .eq('product_id', item.id)
          .eq('attribute_value', String(item.size))
          .single();

        if (selectError || !variant) {
          console.error(`[webhook] variant not found: product_id=${item.id} size=${item.size}`, selectError?.message);
          continue;
        }

        const currentStock: number = variant.stock ?? 0;
        const qty: number = item.quantity;
        const newStock = Math.max(0, currentStock - qty);
        const deficit = qty - currentStock;
        const newToProduce = deficit > 0 ? (variant.to_produce ?? 0) + deficit : (variant.to_produce ?? 0);

        const { error: updateError } = await supabase
          .from('product_variants')
          .update({ stock: newStock, to_produce: newToProduce })
          .eq('id', variant.id);

        if (updateError) {
          console.error(`[webhook] stock update failed for variant ${variant.id}:`, updateError.message);
        } else {
          console.log(`[webhook] stock updated: variant=${variant.id} stock ${currentStock}→${newStock} to_produce→${newToProduce}`);
        }
      }
    }

    // Сохраняем уведомление для покупательского бота
    if (supabaseUrl && serviceKey) {
      const supabase2 = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
      const tgNorm = (meta.order_tg ?? '').replace(/^@/, '').replace(/^https?:\/\/t\.me\//i, '').toLowerCase().trim();

      const orderData = {
        name: meta.order_name,
        email: meta.order_email,
        phone: meta.order_phone,
        tg: meta.order_tg,
        city: meta.order_city,
        delivery: meta.order_delivery,
        address: meta.order_address,
        items,
        deliveryCost,
        totalPaid: Number(payment.amount?.value ?? 0),
      };

      // Ищем уже существующую запись (мог сохранить chat_id раньше)
      const { data: existing } = await supabase2
        .from('order_notifications')
        .select('customer_chat_id')
        .eq('payment_id', payment.id)
        .single();

      await supabase2.from('order_notifications').upsert({
        payment_id: payment.id,
        tg_username: tgNorm,
        order_data: orderData,
        sent: false,
      }, { onConflict: 'payment_id' });

      // Если знаем chat_id покупателя — шлём сразу
      const customerChatId = existing?.customer_chat_id;
      const customerToken = process.env.CUSTOMER_BOT_TOKEN;
      if (customerChatId && customerToken) {
        const items_ = (orderData.items ?? [])
          .map((i: any) => `• ${escapeHtml(String(i.name))} (р.${escapeHtml(String(i.size))}) x${i.quantity} — ${i.price * i.quantity}₽`)
          .join('\n');
        const text =
          `✅ <b>Заказ подтверждён!</b>\n\n` +
          `🛒 <b>Состав:</b>\n${items_}\n\n` +
          `🏙 <b>Город:</b> ${escapeHtml(orderData.city)}\n` +
          `📍 <b>Адрес:</b> ${escapeHtml(orderData.address)}\n` +
          `🚚 <b>Доставка:</b> ${escapeHtml(orderData.delivery)} — ${orderData.deliveryCost}₽\n` +
          `💰 <b>Итого оплачено:</b> ${orderData.totalPaid}₽\n\n` +
          `Скоро свяжемся с тобой! 🤍`;
        await fetch(`https://api.telegram.org/bot${customerToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: customerChatId, text, parse_mode: 'HTML' }),
        });
        await supabase2.from('order_notifications').update({ sent: true }).eq('payment_id', payment.id);
      }
    }

    revalidatePath('/products');
    revalidatePath('/products/[slug]', 'page');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhook] Unhandled error:', err);
    return NextResponse.json({ ok: true });
  }
}
