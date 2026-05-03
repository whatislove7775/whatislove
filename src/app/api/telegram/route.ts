import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderData } = body;

    // Эти переменные мы добавим в Vercel позже
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Собираем красивое сообщение
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

💰 <b>ИТОГО:</b> ${orderData.total}₽
    `;

    // Если ключей пока нет, просто имитируем успех для тестов фронтенда
    if (!token || !chatId) {
      console.warn('Telegram ключи не настроены, но заказ прошел!');
      return NextResponse.json({ success: true });
    }

    // Отправляем запрос в Telegram API
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка отправки в TG:', error);
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 });
  }
}
