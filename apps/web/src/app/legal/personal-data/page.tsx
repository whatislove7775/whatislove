import Link from "next/link";
import { DraftDoc } from "@/components/legal/DraftDoc";
import { legalMetadata } from "@/components/legal/meta";
import { Tbd } from "@/components/legal/Placeholder";

export const metadata = legalMetadata("personal-data");

export default function PersonalDataConsentPage() {
  return (
    <DraftDoc
      slug="personal-data"
      summary={
        <p>
          <strong>Коротко.</strong> Регистрируясь, вы&nbsp;соглашаетесь, что&nbsp;сервис обрабатывает минимальный набор данных,
          нужный для&nbsp;работы: имя на&nbsp;сервисе, хеш пароля, настройки аватара, диалоги и&nbsp;созвоны. Почту и&nbsp;телефон клиента мы&nbsp;не&nbsp;запрашиваем.
        </p>
      }
      sections={[
        {
          id: "who",
          title: "Кому даётся согласие",
          body: (
            <p>
              Оператору: <Tbd what="наименование" />, ИНН <Tbd />, адрес <Tbd />.
            </p>
          ),
        },
        {
          id: "data",
          title: "Перечень данных",
          body: (
            <p>
              Перечень описан в <Link href="/legal/privacy">политике конфиденциальности</Link>.
            </p>
          ),
          todo: "Точный перечень для\u00a0клиентов и\u00a0специалистов.",
        },
        { id: "purposes", title: "Цели обработки", todo: "" },
        { id: "actions", title: "Действия с\u00a0данными и\u00a0способы обработки", todo: "" },
        { id: "term", title: "Срок действия согласия", todo: "" },
        {
          id: "withdraw",
          title: "Как\u00a0отозвать согласие",
          body: (
            <p>
              Удалите аккаунт в&nbsp;настройках кабинета или&nbsp;напишите на <a href="mailto:support@aprosop.ru">support@aprosop.ru</a>.
            </p>
          ),
          todo: "Порядок и\u00a0сроки отзыва.",
        },
      ]}
    />
  );
}
