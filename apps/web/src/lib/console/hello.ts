/**
 * A small hello for people who open devtools. Printed once per page load (production too),
 * styled with %c. Nothing is collected or sent — it only writes to the local console.
 */
import { readPrefs } from "@/lib/privacy/stealth";

let printed = false;

export function consoleHello() {
  if (printed || typeof window === "undefined") return;
  printed = true;
  // «Незаметный режим»: the page pretends to be something else — stay silent here too.
  try {
    if (readPrefs().stealth.enabled) return;
  } catch {
    /* no prefs → normal hello */
  }
  const face = [
    "   ╭──────────────╮",
    "   │   ◠‿◠  ✦     │",
    "   ╰─╮────────────╯",
    "     ╰ Aprosop",
  ].join("\n");
  try {
    console.log(
      `%c${face}`,
      "font: 600 13px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace; color: #7aa5ff;",
    );
    console.log(
      "%cДаже здесь всё анонимно 🙂%c\nМы не\u00a0собираем ваши данные: ни\u00a0почты, ни\u00a0телефона, ни\u00a0лица\u00a0— только псевдоним.\nЕсли вы\u00a0разработчик и\u00a0вам интересно, как\u00a0это\u00a0устроено,\u00a0— напишите нам: support@aprosop.ru",
      "font: 700 16px/1.4 system-ui, sans-serif; color: #a99bff;",
      "font: 400 13px/1.5 system-ui, sans-serif; color: inherit;",
    );
  } catch {
    /* console may be unavailable in some embedded browsers */
  }
}
