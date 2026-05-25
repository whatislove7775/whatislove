import type { Metadata } from "next";
import PsychologistsClient from "./PsychologistsClient";

export const metadata: Metadata = {
  title: "Специалисты — верифицированные психологи онлайн",
  description:
    "Каталог верифицированных психологов-консультантов. Все специалисты с подтверждёнными дипломами. Анонимная видео-консультация. Первая сессия бесплатно.",
  keywords: [
    "психолог онлайн записаться",
    "найти психолога онлайн",
    "психолог консультация",
    "онлайн терапевт",
    "CBT психолог онлайн",
  ],
  openGraph: {
    title: "Специалисты aprosop — верифицированные психологи",
    description: "Каталог консультантов с подтверждёнными дипломами. Анонимно, без регистрации по паспорту.",
    url: "https://aprosop.ru/psychologists",
  },
  alternates: { canonical: "https://aprosop.ru/psychologists" },
};

export default function PsychologistsPage() {
  return <PsychologistsClient />;
}
