/** Registry of legal documents: footer, /legal index, sitemap and consent links read from here. */
export interface LegalDocMeta {
  slug: string;
  title: string;
  /** Short label for the footer */
  short: string;
  description: string;
  audience: "all" | "clients" | "specialists";
}

export const LEGAL_DOCS: LegalDocMeta[] = [
  {
    slug: "privacy",
    title: "Политика конфиденциальности",
    short: "Конфиденциальность",
    description: "Какие данные обрабатывает Aprosop, зачем, как\u00a0долго хранит и\u00a0как\u00a0их\u00a0удалить.",
    audience: "all",
  },
  {
    slug: "terms",
    title: "Пользовательское соглашение",
    short: "Пользовательское соглашение",
    description: "Правила использования сервиса Aprosop для\u00a0клиентов и\u00a0специалистов.",
    audience: "all",
  },
  {
    slug: "offer",
    title: "Публичная оферта",
    short: "Публичная оферта",
    description: "Условия оказания платных услуг: пополнение баланса и\u00a0оплата созвонов со\u00a0специалистами.",
    audience: "clients",
  },
  {
    slug: "personal-data",
    title: "Согласие на\u00a0обработку персональных данных",
    short: "Согласие на\u00a0обработку данных",
    description: "Текст согласия на\u00a0обработку персональных данных, которое даётся при\u00a0регистрации.",
    audience: "all",
  },
  {
    slug: "cookies",
    title: "Политика использования cookie",
    short: "Cookie",
    description: "Какие cookie и\u00a0хранилища браузера использует Aprosop и\u00a0зачем.",
    audience: "all",
  },
  {
    slug: "refunds",
    title: "Правила возврата",
    short: "Правила возврата",
    description: "Как\u00a0вернуть деньги с\u00a0баланса и\u00a0что\u00a0происходит с\u00a0оплатой при\u00a0отмене созвона.",
    audience: "clients",
  },
  {
    slug: "specialist-agreement",
    title: "Договор со\u00a0специалистом",
    short: "Договор со\u00a0специалистом",
    description: "Условия сотрудничества психологов с\u00a0сервисом Aprosop: проверка, выплаты, обязанности сторон.",
    audience: "specialists",
  },
  {
    slug: "requisites",
    title: "Реквизиты",
    short: "Реквизиты",
    description: "Сведения об\u00a0операторе сервиса Aprosop и\u00a0контакты для\u00a0обращений.",
    audience: "all",
  },
];

export function legalDoc(slug: string): LegalDocMeta {
  const d = LEGAL_DOCS.find((x) => x.slug === slug);
  if (!d) throw new Error(`Unknown legal doc ${slug}`);
  return d;
}

/** Marker for text that the lawyers have not written yet. */
export const TBD = "[будет заполнено]";
