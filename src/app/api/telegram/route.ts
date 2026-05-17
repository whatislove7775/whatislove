import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const escapeHtml = (text: string) => {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

async function decrementStock(items: any[]): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) return 'ошибка: SUPABASE_URL или ANON_KEY не заданы';
  if (!serviceKey) return 'ошибка: SUPABASE_SERVICE_ROLE_KEY не задан в Vercel';

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const errors: string[] = [];

  for (const item of items) {
    const size = String(item.size);
    const productId = Number(item.id);
    const qty: number = item.quantity;

    const { data: variant, error: selectError } = await supabase
      .from('product_variants')
      .select('id, stock, to_produce')
      .eq('product_id', productId)
      .eq('attribute_value', size)
      .single();

    if (selectError || !variant) {
      errors.push(`variant not found: product=${productId} size=${size}`);
      continue;
    }

    const currentStock: number = variant.stock ?? 0;
    const currentToProduce: number = variant.to_produce ?? 0;

    let newStock: number;
    let newToProduce: number;

    if (currentStock >= qty) {
      // Достаточно на складе
      newStock = currentStock - qty;
      newToProduce = currentToProduce;
    } else {
      // Частично или полностью дефицит
      const deficit = qty - currentStock;
      newStock = 0;
      newToProduce = currentToProduce + deficit;
    }

    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock: newStock, to_produce: newToProduce })
      .eq('id', variant.id);

    if (updateError) {
      errors.push(`update failed variant ${variant.id}: ${updateError.message}`);
    }
  }

  return errors.length === 0 ? 'ok' : errors.join(' | ');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderData } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Ключи Telegram не найдены в Vercel! Сделай Redeploy.' }, { status: 400 });
    }

    const itemsList = orderData.items
      .map((i: any) => `- ${escapeHtml(i.name)} (Размер: ${i.size}) x${i.quantity} = ${i.price * i.quantity}₽`)
      .join('\n');

    const message = `
📦 <b>НОВЫЙ ЗАКАЗ!</b>
👤 <b>ФИО:</b> ${escapeHtml(orderData.name)}
📧 <b>Email:</b> ${escapeHtml(orderData.email)}
📞 <b>Телефон:</b> ${escapeHtml(orderData.phone)}
✈️ <b>TG:</b> ${escapeHtml(orderData.tg)}
🏙 <b>Город:</b> ${escapeHtml(orderData.city)}
🚚 <b>Служба:</b> ${escapeHtml(orderData.delivery)}
📍 <b>ПВЗ:</b> ${escapeHtml(orderData.address)}

🛒 <b>Корзина:</b>
${itemsList}

🚚 <b>Стоимость доставки:</b> ${orderData.deliveryCost > 0 ? orderData.deliveryCost + '₽' : 'Не рассчитана / Другой сервис'}
💰 <b>ИТОГО С ДОСТАВКОЙ:</b> ${orderData.total + orderData.deliveryCost}₽
    `;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      return NextResponse.json({ error: `Telegram: ${tgData.description}` }, { status: 400 });
    }

    const stockResult = await decrementStock(orderData.items);
    if (stockResult !== 'ok') {
      console.error('Stock decrement issue:', stockResult);
    }

    // Сбрасываем кэш страниц товаров чтобы новый остаток показался сразу
    revalidatePath('/products');
    revalidatePath('/products/[slug]', 'page');

    return NextResponse.json({ success: true, stockUpdate: stockResult });
  } catch (error: any) {
    console.error('Ошибка сервера TG:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
