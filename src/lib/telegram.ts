// t.me местами заблокирован и перестаёт открываться; telegram.me — тот же
// официальный домен Telegram. Переписываем t.me → telegram.me только в АДРЕСЕ
// ссылки (href); внешний вид/текст ссылки при этом не трогаем.
// Не-телеграмные ссылки (instagram, behance и т.п.) остаются без изменений.
export function telegramHref(url: string | null | undefined): string {
  if (!url) return url ?? '';
  return url.replace(/\bt\.me\//g, 'telegram.me/');
}
