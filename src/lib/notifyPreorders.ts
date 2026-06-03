import { SupabaseClient } from '@supabase/supabase-js';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

function esc(t: any) {
  return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function sendCustomer(chatId: number, text: string): Promise<boolean> {
  const token = process.env.CUSTOMER_BOT_TOKEN;
  if (!token) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch { return false; }
}

export async function notifyPreorders(
  supabase: SupabaseClient,
  productId: number,
): Promise<{ notified: number; noBot: string[] }> {
  // Получаем все не уведомлённые предзаказы по товару
  const { data: pending } = await supabase
    .from('preorders')
    .select('id, name, telegram, product_name, product_slug')
    .eq('product_id', productId)
    .is('notified_at', null);

  if (!pending?.length) return { notified: 0, noBot: [] };

  const productName: string = pending[0].product_name ?? '';
  const productSlug: string = pending[0].product_slug ?? '';

  // Ищем chat_id по telegram username
  const uniqueSet = new Set<string>(pending.map((p: any) => p.telegram.toLowerCase().replace(/^@/, '')));
  const usernames = Array.from(uniqueSet);
  const { data: chatIdRows } = await supabase
    .from('tg_chat_ids')
    .select('tg_username, chat_id')
    .in('tg_username', usernames);

  const chatIdMap = new Map<string, number>();
  for (const row of chatIdRows ?? []) chatIdMap.set(row.tg_username, row.chat_id);

  const msg =
    `🎉 <b>Товар снова в наличии!</b>\n\n` +
    `🛍 <b>${esc(productName)}</b> — уже можно заказать!\n\n` +
    `👉 <a href="${siteUrl}/products/${productSlug}">${siteUrl}/products/${productSlug}</a>`;

  const notifiedIds: string[] = [];
  const noBot: string[] = [];

  await Promise.all(pending.map(async (p: any) => {
    const uname = p.telegram.toLowerCase().replace(/^@/, '');
    const chatId = chatIdMap.get(uname);
    if (chatId) {
      const ok = await sendCustomer(chatId, msg);
      if (ok) notifiedIds.push(p.id);
      else noBot.push(p.telegram);
    } else {
      noBot.push(p.telegram);
    }
  }));

  // Отмечаем уведомлённых
  if (notifiedIds.length) {
    await supabase.from('preorders').update({ notified_at: new Date().toISOString() }).in('id', notifiedIds);
  }

  // Уведомляем администратора итогами
  const adminToken = process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TELEGRAM_CHAT_ID;
  if (adminToken && adminChatId) {
    const lines = [
      `📦 <b>Предзаказы — ${esc(productName)}</b>`,
      `✅ Уведомлено: ${notifiedIds.length}`,
      noBot.length ? `⚠️ Нет бота (свяжитесь вручную): ${noBot.map(t => '@' + t.replace(/^@/, '')).join(', ')}` : '',
    ].filter(Boolean).join('\n');
    await fetch(`https://api.telegram.org/bot${adminToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: adminChatId, text: lines, parse_mode: 'HTML' }),
    }).catch(() => {});
  }

  return { notified: notifiedIds.length, noBot };
}
