import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://aprosop.ru";
const SITE_NAME = "aprosop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "aprosop — Анонимные психологические консультации онлайн",
    template: "%s | aprosop",
  },
  description:
    "Анонимная видео-консультация с психологом. AI-маска лица, P2P видео, Zero-Knowledge архитектура. Специалист не узнает ваше имя или лицо. Первая сессия бесплатно.",
  keywords: [
    "психолог онлайн",
    "анонимная консультация психолога",
    "психологическая помощь онлайн",
    "видео консультация психолог",
    "анонимный психолог",
    "онлайн терапия",
    "психолог без регистрации",
    "конфиденциальная консультация",
    "психолог дистанционно",
    "помощь психолога онлайн бесплатно",
  ],

  authors: [{ name: "aprosop", url: SITE_URL }],
  creator: "aprosop",
  publisher: "aprosop",
  category: "health",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "aprosop — Говори свободно. Скрыли остальное.",
    description:
      "Первая в России анонимная платформа психологических консультаций. AI-маска лица, P2P видео без серверов, Zero-Knowledge архитектура. Специалист видит ваши эмоции — не лицо.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "aprosop — анонимные психологические консультации",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "aprosop — Анонимные консультации с психологом",
    description:
      "AI-маска скрывает ваше лицо. P2P видео не проходит через сервер. Zero-Knowledge: мы не знаем, кто вы.",
    images: ["/og-image.png"],
    creator: "@aprosop",
    site: "@aprosop",
  },

  icons: {
    icon: [
      { url: "/favicon.svg",      type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "mask-icon",       url: "/favicon.svg",  color: "#4DA6FF" },
      { rel: "shortcut icon",   url: "/favicon.ico" },
    ],
  },

  manifest: "/manifest.json",

  alternates: {
    canonical: SITE_URL,
    languages: { "ru-RU": SITE_URL },
  },

  verification: {
    google: "aprosop-google-site-verification",
    yandex: "aprosop-yandex-verification",
  },

  other: {
    "msapplication-TileColor":  "#0C0F1A",
    "msapplication-TileImage":  "/icon-192.png",
    "msapplication-config":     "none",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "aprosop",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0C0F1A" },
    { media: "(prefers-color-scheme: light)", color: "#0C0F1A" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// ── JSON-LD Structured Data ────────────────────────────────────────
function StructuredData() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "aprosop",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    description:
      "Анонимная платформа психологических консультаций с AI-маской лица и Zero-Knowledge архитектурой.",
    foundingDate: "2024",
    areaServed: { "@type": "Country", name: "Россия" },
    serviceType: "Психологические консультации онлайн",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@aprosop.ru",
      availableLanguage: "Russian",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "aprosop",
    description: "Анонимные психологические консультации онлайн",
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/psychologists?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "ru-RU",
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/#service`,
    name: "Анонимные психологические консультации aprosop",
    provider: { "@id": `${SITE_URL}/#organization` },
    serviceType: "Психологическое консультирование",
    description:
      "Видео-консультации с верифицированными психологами. AI-маска скрывает лицо клиента, P2P видеосвязь исключает запись на сервере.",
    areaServed: { "@type": "Country", name: "Россия" },
    audience: {
      "@type": "Audience",
      audienceType: "Взрослые от 18 лет, испытывающие тревогу, депрессию или нуждающиеся в психологической поддержке",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: SITE_URL,
      availableLanguage: "Russian",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: "0",
      description: "Первая консультация бесплатно",
      eligibleCustomerType: "Новые клиенты",
    },
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Видит ли психолог моё настоящее лицо на консультации?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Нет. AI-маска обрабатывается локально на вашем устройстве до передачи видео. Специалист видит только анонимную маску с передачей эмоциональных паттернов — лицо остаётся полностью скрытым.",
        },
      },
      {
        "@type": "Question",
        name: "Как проходит анонимная консультация с психологом онлайн?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Зарегистрируйтесь за 30 секунд (только хэш email, без имени и телефона), выберите верифицированного специалиста, войдите в защищённую комнату. P2P видео и AI-маска включаются автоматически.",
        },
      },
      {
        "@type": "Question",
        name: "Сколько стоит консультация психолога на aprosop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Первая вводная консультация бесплатна для первых 100 клиентов. Далее цена зависит от специалиста — от 3 800 ₽ за сессию 50 минут.",
        },
      },
      {
        "@type": "Question",
        name: "Что такое Zero-Knowledge архитектура в психологической платформе?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zero-Knowledge означает, что aprosop архитектурно не может узнать, кто вы — даже при желании. Мы не знаем вашего имени: email хранится как SHA-256 хэш. Видео не проходит через сервер: соединение P2P напрямую между вами и специалистом.",
        },
      },
      {
        "@type": "Question",
        name: "Можно ли провести консультацию без видео, только голосом?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Да. Вы можете отключить камеру в любой момент. Аудио-консультации полностью поддерживаются и также не записываются.",
        },
      },
      {
        "@type": "Question",
        name: "Как проверяются психологи на платформе aprosop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Каждый специалист проходит ручную верификацию: проверяем дипломы об образовании, документы о повышении квалификации и опыт работы. Специалисты без подтверждённых документов не допускаются.",
        },
      },
      {
        "@type": "Question",
        name: "Записываются ли видео и аудио сессий?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Нет. Видеопоток идёт напрямую между участниками (P2P WebRTC) и не проходит через серверы aprosop. Запись сессий технически невозможна на уровне архитектуры.",
        },
      },
      {
        "@type": "Question",
        name: "Чем aprosop отличается от Ясно, Alter или Zigmund?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Конкуренты хранят ФИО, телефон, историю сессий и записи разговоров. aprosop создан по принципу privacy-first: приватность — не функция, а архитектурный факт. Мы физически не можем получить ваши данные.",
        },
      },
    ],
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Как записаться на анонимную консультацию к психологу онлайн",
    description: "Три шага до безопасной консультации с психологом через aprosop",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Создайте анонимный профиль",
        text: "Введите email — мы сохраним только его SHA-256 хэш. Никаких ФИО, телефонов, паспортов. Регистрация занимает 30 секунд.",
        url: `${SITE_URL}/register`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Выберите специалиста",
        text: "Просмотрите каталог верифицированных консультантов с подтверждёнными дипломами. Фильтр по специализации и цене.",
        url: `${SITE_URL}/psychologists`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Войдите в защищённую комнату",
        text: "P2P видео и AI-маска включаются автоматически. Говорите свободно — специалист видит ваши эмоции, не лицо.",
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
    ],
  };

  const schemas = [organization, website, service, faqPage, howTo, breadcrumb];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" dir="ltr">
      <head>
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  );
}
