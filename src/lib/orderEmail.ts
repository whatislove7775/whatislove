// Письмо-подтверждение покупателю после успешной оплаты.
// Отправляется через SMTP (например, почта на Beget) с помощью nodemailer.
// Если SMTP_USER/SMTP_PASSWORD не заданы в переменных окружения, отправка тихо
// пропускается (как и с Telegram-токенами в остальных вебхуках), чтобы отсутствие
// настроенной почты не ломало оформление заказа.

import nodemailer from 'nodemailer';

function escapeHtml(t: any): string {
  return String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let transporter: import('nodemailer').Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT ?? 465);
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user, pass },
  });
  return transporter;
}

interface OrderEmailItem { name: string; size: string | number; quantity: number; price: number; }

export async function sendOrderConfirmationEmail(params: {
  to: string;
  name: string;
  items: OrderEmailItem[];
  deliveryCost: number;
  totalPaid: number;
  city: string;
  address: string;
  delivery: string;
}) {
  const t = getTransporter();
  if (!t) {
    console.warn('[order-email] SMTP_HOST/SMTP_USER/SMTP_PASSWORD not set — skipping customer email');
    return;
  }
  if (!params.to) return;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;

  const itemsHtml = params.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${escapeHtml(i.name)} (р.${escapeHtml(i.size)})</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${escapeHtml(i.quantity)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;">${i.price * i.quantity}₽</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 520px; margin: 0 auto; color:#000;">
      <h2 style="margin: 0 0 6px;">заказ оплачен ✓</h2>
      <p style="color:#555; margin: 0 0 20px;">спасибо, ${escapeHtml(params.name)}! твой заказ принят и скоро будет обработан.</p>
      <table style="width:100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 10px;border-bottom:2px solid #000;">товар</th>
            <th style="padding:8px 10px;border-bottom:2px solid #000;">кол-во</th>
            <th style="text-align:right;padding:8px 10px;border-bottom:2px solid #000;">сумма</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="line-height:1.6; margin: 0 0 16px;">
        <b>доставка:</b> ${escapeHtml(params.delivery) || '—'} — ${params.deliveryCost > 0 ? `${params.deliveryCost}₽` : 'бесплатно'}<br/>
        <b>город:</b> ${escapeHtml(params.city) || '—'}<br/>
        <b>адрес / ПВЗ:</b> ${escapeHtml(params.address) || '—'}
      </p>
      <p style="font-weight:800; font-size:16px; margin: 0 0 24px;">итого оплачено: ${params.totalPaid}₽</p>
      <p style="color:#888; font-size:12px;">wh4tislove — дизайн-студия · t.me/whatislove_r</p>
    </div>`;

  try {
    await t.sendMail({
      from,
      to: params.to,
      subject: 'заказ оплачен — wh4tislove',
      html,
    });
  } catch (e) {
    console.error('[order-email] send failed:', e);
  }
}
