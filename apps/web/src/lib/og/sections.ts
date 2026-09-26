/**
 * Link-preview texts per section: one place for the card title (≤ 5 words),
 * the one-line subtitle, the illustration and the alt text.
 * Pages keep their <title>/description in their own `metadata`.
 */
import type { OgCardProps } from "./card";

export type OgSection = OgCardProps & { alt: string };

export const OG: Record<string, OgSection> = {
  home: {
    title: "Психолог онлайн, и\u00a0никто не\u00a0узнает, кто вы",
    subtitle: "",
    lines: [{ text: "Психолог онлайн," }, { text: "и\u00a0никто не\u00a0узнает,", accent: true }, { text: "кто вы", accent: true }],
    art: "bubble",
    alt: "Aprosop\u00a0— психолог онлайн, и\u00a0никто не\u00a0узнает, кто вы",
  },
  start: {
    title: "Начать анонимно",
    subtitle: "Нужен только пароль, имя создаётся само",
    art: "key",
    alt: "Анонимная регистрация в\u00a0Aprosop",
  },
  login: {
    title: "Вход в\u00a0Aprosop",
    subtitle: "По\u00a0имени вроде «тихий-кит-4821»",
    art: "key",
    alt: "Вход в\u00a0Aprosop",
  },
  recover: {
    title: "Восстановить доступ",
    subtitle: "По\u00a0имени и\u00a0ключу восстановления",
    art: "key",
    alt: "Восстановление доступа в\u00a0Aprosop",
  },
  join: {
    title: "Для\u00a0психологов",
    subtitle: "Анонимные клиенты, ручная проверка анкеты",
    art: "badge",
    alt: "Aprosop для\u00a0психологов",
  },
  privacy: {
    title: "Конфиденциальность",
    subtitle: "Что\u00a0храним, чего не\u00a0храним и\u00a0как\u00a0удалить",
    art: "doc",
    alt: "Политика конфиденциальности Aprosop",
  },
  terms: {
    title: "Условия использования",
    subtitle: "Правила сервиса простым языком",
    art: "doc",
    alt: "Условия использования Aprosop",
  },
  legal: {
    title: "Документы сервиса",
    subtitle: "Правила и\u00a0приватность простым языком",
    art: "doc",
    alt: "Документы Aprosop",
  },
  articles: {
    title: "Статьи о\u00a0психике",
    subtitle: "Коротко и\u00a0со\u00a0ссылками на\u00a0исследования",
    art: "book",
    alt: "Статьи Aprosop",
  },
  article: {
    kicker: "Статья",
    title: "Полезное чтение",
    subtitle: "Коротко и\u00a0со\u00a0ссылками на\u00a0исследования",
    art: "book",
    alt: "Статья Aprosop",
  },
  practices: {
    title: "Практики для\u00a0себя",
    subtitle: "Дыхание и\u00a0заземление за\u00a0пять минут",
    art: "breath",
    alt: "Практики Aprosop",
  },
  practice: {
    kicker: "Практика",
    title: "Пять минут для\u00a0себя",
    subtitle: "Простое упражнение с\u00a0понятными шагами",
    art: "breath",
    alt: "Практика Aprosop",
  },
  specialists: {
    title: "Проверенные психологи",
    subtitle: "Диалог и\u00a0звонки без\u00a0раскрытия личности",
    art: "chat",
    alt: "Психологи Aprosop",
  },
  business: {
    kicker: "Для\u00a0компаний",
    title: "Психолог для\u00a0сотрудников",
    subtitle: "Анонимно для\u00a0людей, прозрачно для\u00a0бюджета",
    art: "lock",
    alt: "Aprosop для\u00a0компаний\u00a0— анонимная психологическая помощь сотрудникам",
  },
  /** private areas (cabinets, calls, staff): noindex, generic card */
  private: {
    title: "Анонимная помощь психолога",
    subtitle: "Эта страница открывается после входа",
    art: "lock",
    alt: "Aprosop\u00a0— анонимная психологическая помощь",
  },
};

/** Titles longer than this are replaced by the section title on detail cards. */
export const OG_MAX_TITLE = 60;

/**
 * Per-page Open Graph / Twitter texts. A page's `openGraph` replaces the root
 * one entirely, so this repeats siteName/locale; images come from the nearest
 * opengraph-image.tsx / twitter-image.tsx.
 */
export function ogMeta(path: string, title: string, description: string) {
  return {
    openGraph: { type: "website" as const, locale: "ru_RU", siteName: "Aprosop", url: path, title, description },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
