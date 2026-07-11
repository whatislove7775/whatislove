import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { isRateLimited, getClientIp } from '@/lib/rateLimit';

function esc(t: any) {
  return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(`preorder:${getClientIp(req)}`, 8, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'слишком много запросов, попробуйте позже' }, { status: 429 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return NextResponse.json({ error: 'server error' }, { status: 500 });

    const body = await req.json();

    // Honeypot: скрытое поле, которое реальный пользователь никогда не заполнит
    if (String(body.website ?? '').trim()) {
      return NextResponse.json({ ok: true });
    }

    const productId = Number(body.product_id);
    const name = String(body.name ?? '').trim().slice(0, 200);
    const telegram = String(body.telegram ?? '').trim().replace(/^@/, '').toLowerCase().slice(0, 200);
    const size = String(body.size ?? '').trim().slice(0, 50);
    const productName = String(body.product_name ?? '').trim().slice(0, 300);
    const productSlug = String(body.product_slug ?? '').trim().slice(0, 200);

    if (!productId || isNaN(productId)) return NextResponse.json({ error: 'product_id обязателен' }, { status: 400 });
    if (!name) return NextResponse.json({ error: 'укажите имя' }, { status: 400 });
    if (!telegram) return NextResponse.json({ error: 'укажите телеграм' }, { status: 400 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false },
    });

    // Проверяем дубликат (тот же telegram + товар, ещё не уведомлен)
    const { data: existing } = await supabase
      .from('preorders')
      .select('id')
      .eq('product_id', productId)
      .eq('telegram', telegram)
      .is('notified_at', null)
      .limit(1);

    if (existing?.length) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error } = await supabase.from('preorders').insert({
      product_id: productId,
      product_name: productName,
      product_slug: productSlug,
      size,
      name,
      telegram,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Уведомление администратору
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const msg = `🔔 <b>НОВЫЙ ПРЕДЗАКАЗ!</b>\n👤 ${esc(name)}\n✈️ @${esc(telegram)}\n🏷 ${esc(productName)}${size ? ` (р.${esc(size)})` : ''}`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' }),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('preorder error:', e);
    return NextResponse.json({ error: 'внутренняя ошибка' }, { status: 500 });
  }
}
