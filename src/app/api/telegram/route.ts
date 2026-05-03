import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderData } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json({ error: 'Ключи Telegram не найдены в Vercel! Сделай Redeploy.' }, { status: 400 });
    }

    const message = `
📦 <b>НОВЫЙ ЗАКАЗ!</b>
👤 <b>ФИО:</b> ${orderData.name}
📧 <b>Email:</b> ${orderData.email}
📞 <b>Телефон:</b> ${orderData.phone}
✈️ <b>TG:</b> ${orderData.tg}
🏙 <b>Город:</b> ${orderData.city}
🚚 <b>Служба:</b> ${orderData.delivery}
📍 <b>ПВЗ:</b> ${orderData.address}

🛒 <b>Корзина:</b>
${orderData.items.map((i: any) => `- ${i.name} (Размер: ${i.size}) x${i.quantity} = ${i.price * i.quantity}₽`).join('\n')}

🚚 <b>Стоимость доставки:</b> ${orderData.deliveryCost > 0 ? orderData.deliveryCost + '₽' : 'Не рассчитана / Другой сервис'}
💰 <b>ИТОГО С ДОСТАВКОЙ:</b> ${orderData.total + orderData.deliveryCost}₽
    `;

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const tgData = await response.json();
    
    // Если Телеграм ругается (например, не нажат Start)
    if (!tgData.ok) {
      console.error('Ошибка от самого Telegram:', tgData);
      return NextResponse.json({ error: `Telegram отклонил сообщение: ${tgData.description}` }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ошибка сервера TG:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
