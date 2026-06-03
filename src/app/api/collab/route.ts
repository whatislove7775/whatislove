import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const escapeHtml = (text: string) =>
  String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export async function POST(req: NextRequest) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY не задан' }, { status: 500 });
    }

    const body = await req.json();
    const name = String(body.name ?? '').trim().slice(0, 200);
    const telegram = String(body.telegram ?? '').trim().slice(0, 200);
    const phone = String(body.phone ?? '').trim().slice(0, 100);
    const title = String(body.title ?? '').trim().slice(0, 300);
    const description = String(body.description ?? '').trim().slice(0, 5000);
    const price = String(body.price ?? '').trim().slice(0, 100);
    const images = Array.isArray(body.images)
      ? body.images.filter((u: any) => typeof u === 'string').slice(0, 12)
      : [];

    // Минимальная валидация: нужно имя, хотя бы один контакт и описание/название.
    if (!name) return NextResponse.json({ error: 'укажите имя' }, { status: 400 });
    if (!telegram && !phone) return NextResponse.json({ error: 'оставьте телеграм или телефон' }, { status: 400 });
    if (!title && !description) return NextResponse.json({ error: 'опишите идею' }, { status: 400 });

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from('collab_requests')
      .insert({ name, telegram, phone, title, description, price, images })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Уведомление в телеграм (если ключи заданы) — не блокирует ответ при ошибке.
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const message = `
🤝 <b>НОВАЯ ЗАЯВКА НА КОЛЛАБОРАЦИЮ!</b>
👤 <b>Имя:</b> ${escapeHtml(name)}
✈️ <b>TG:</b> ${escapeHtml(telegram) || '—'}
📞 <b>Телефон:</b> ${escapeHtml(phone) || '—'}
🏷 <b>Товар/идея:</b> ${escapeHtml(title) || '—'}
💰 <b>Желаемая цена:</b> ${escapeHtml(price) || '—'}
🖼 <b>Фото:</b> ${images.length}

📝 <b>Описание:</b>
${escapeHtml(description) || '—'}

Смотри в админке: /admin/collab`;
      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML', disable_web_page_preview: true }),
        });
      } catch (e) {
        console.error('collab tg notify failed:', e);
      }
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (e: any) {
    console.error('collab submit error:', e);
    return NextResponse.json({ error: 'внутренняя ошибка сервера' }, { status: 500 });
  }
}
