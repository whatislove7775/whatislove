import { Award, BookOpen, FileBadge, GraduationCap, Landmark, Newspaper, Presentation, UsersRound, type LucideIcon } from "lucide-react";
import type { CredentialKind } from "@/lib/api/credentials";

export const KIND_ICON: Record<CredentialKind, { icon: LucideIcon; tone: "lilac" | "sun" | "coral" | "cyan" | "mint" }> = {
  diploma: { icon: GraduationCap, tone: "lilac" },
  retraining: { icon: BookOpen, tone: "cyan" },
  method: { icon: Award, tone: "sun" },
  supervision: { icon: UsersRound, tone: "mint" },
  membership: { icon: Landmark, tone: "coral" },
  publication: { icon: Newspaper, tone: "cyan" },
  course: { icon: Presentation, tone: "sun" },
  other: { icon: FileBadge, tone: "lilac" },
};

export function KindIcon({ kind, size = 20, className }: { kind: CredentialKind; size?: number; className: string }) {
  const { icon: Icon, tone } = KIND_ICON[kind];
  return (
    <span className={className} data-tone={tone} aria-hidden>
      <Icon size={size} strokeWidth={1.8} />
    </span>
  );
}

/** Field labels per kind; `null` hides the field. */
export interface KindFields {
  title: string;
  titlePlaceholder: string;
  issuer: string | null;
  issuerPlaceholder?: string;
  year: string;
  yearEnd: string | null;
  supervisor: boolean;
  hours: boolean;
  number: string | null;
  links: boolean;
  hint: string;
}

export const KIND_FIELDS: Record<CredentialKind, KindFields> = {
  diploma: {
    title: "Специальность или\u00a0квалификация",
    titlePlaceholder: "Психолог, преподаватель психологии",
    issuer: "Вуз",
    issuerPlaceholder: "МГУ имени М. В. Ломоносова",
    year: "Год выпуска",
    yearEnd: null,
    supervisor: false,
    hours: false,
    number: "Номер диплома",
    links: false,
    hint: "Приложите разворот диплома с\u00a0ФИО и\u00a0печатью. Вкладыш с\u00a0оценками не\u00a0нужен.",
  },
  retraining: {
    title: "Программа",
    titlePlaceholder: "Когнитивно-поведенческая терапия",
    issuer: "Организация",
    issuerPlaceholder: "Институт практической психологии",
    year: "Год окончания",
    yearEnd: null,
    supervisor: false,
    hours: true,
    number: "Номер диплома или\u00a0удостоверения",
    links: false,
    hint: "Подойдёт диплом о\u00a0профессиональной переподготовке или\u00a0удостоверение о\u00a0повышении квалификации.",
  },
  method: {
    title: "Метод или\u00a0модальность",
    titlePlaceholder: "Схема-терапия, базовый уровень",
    issuer: "Кто выдал сертификат",
    issuerPlaceholder: "International Society of Schema Therapy",
    year: "Год",
    yearEnd: null,
    supervisor: false,
    hours: true,
    number: "Номер сертификата",
    links: false,
    hint: "Сертификат школы или\u00a0ассоциации метода.",
  },
  supervision: {
    title: "Формат и\u00a0тема",
    titlePlaceholder: "Индивидуальная супервизия по\u00a0КПТ",
    issuer: "Организация, если есть",
    issuerPlaceholder: "Ассоциация когнитивно-поведенческой психотерапии",
    year: "С\u00a0какого года",
    yearEnd: "По\u00a0какой год",
    supervisor: true,
    hours: true,
    number: null,
    links: false,
    hint: "Справка или\u00a0письмо супервизора с\u00a0количеством часов и\u00a0периодом.",
  },
  membership: {
    title: "Статус",
    titlePlaceholder: "Действительный член",
    issuer: "Ассоциация",
    issuerPlaceholder: "Российское психологическое общество",
    year: "С\u00a0какого года",
    yearEnd: "По\u00a0какой год",
    supervisor: false,
    hours: false,
    number: "Номер членского билета",
    links: true,
    hint: "Членский билет, сертификат или\u00a0ссылка на\u00a0реестр ассоциации.",
  },
  publication: {
    title: "Название статьи или\u00a0книги",
    titlePlaceholder: "Тревога у\u00a0подростков: обзор исследований",
    issuer: "Журнал или\u00a0издательство",
    issuerPlaceholder: "Вопросы психологии",
    year: "Год публикации",
    yearEnd: null,
    supervisor: false,
    hours: false,
    number: null,
    links: true,
    hint: "Достаточно ссылки или\u00a0DOI. Файл\u00a0— по\u00a0желанию.",
  },
  course: {
    title: "Название курса",
    titlePlaceholder: "Работа с\u00a0горем и\u00a0утратой",
    issuer: "Организатор",
    issuerPlaceholder: "Московский институт психоанализа",
    year: "Год",
    yearEnd: null,
    supervisor: false,
    hours: true,
    number: "Номер сертификата",
    links: false,
    hint: "Сертификат или\u00a0удостоверение об\u00a0окончании.",
  },
  other: {
    title: "Название",
    titlePlaceholder: "Например, участие в\u00a0конференции",
    issuer: "Организация",
    year: "Год",
    yearEnd: null,
    supervisor: false,
    hours: false,
    number: "Номер документа",
    links: true,
    hint: "Любой документ, который подтверждает вашу квалификацию.",
  },
};
