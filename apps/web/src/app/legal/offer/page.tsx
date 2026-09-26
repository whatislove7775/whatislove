import Link from "next/link";
import { DraftDoc } from "@/components/legal/DraftDoc";
import { legalMetadata } from "@/components/legal/meta";
import { Tbd } from "@/components/legal/Placeholder";

export const metadata = legalMetadata("offer");

export default function OfferPage() {
  return (
    <DraftDoc
      slug="offer"
      summary={
        <p>
          <strong>Коротко.</strong> Вы&nbsp;пополняете анонимный баланс и&nbsp;оплачиваете с&nbsp;него созвоны со&nbsp;специалистами. Цена
          созвона видна в&nbsp;профиле специалиста до&nbsp;записи.
        </p>
      }
      sections={[
        {
          id: "general",
          title: "Общие положения",
          body: (
            <p>
              Исполнитель: <Tbd what="наименование" />. Оферта адресована любому дееспособному лицу, которое пользуется
              платными возможностями сервиса Aprosop.
            </p>
          ),
          todo: "Термины, момент акцепта оферты.",
        },
        { id: "subject", title: "Предмет договора", todo: "Описание услуг: доступ к\u00a0площадке, организация созвонов, баланс." },
        {
          id: "price",
          title: "Стоимость и\u00a0порядок оплаты",
          body: <p>Стоимость созвона указана в&nbsp;профиле специалиста и&nbsp;зависит от&nbsp;длительности. Оплата списывается с&nbsp;баланса.</p>,
          todo: "Способы пополнения баланса, комиссии, валюта, документы об\u00a0оплате.",
        },
        {
          id: "cancel",
          title: "Отмена и\u00a0перенос созвона",
          body: (
            <p>
              Правила отмены и&nbsp;возврата описаны в <Link href="/legal/refunds">правилах возврата</Link>.
            </p>
          ),
        },
        { id: "duties", title: "Права и\u00a0обязанности сторон", todo: "" },
        { id: "liability", title: "Ответственность и\u00a0ограничения", todo: "Сервис не\u00a0оказывает экстренную и\u00a0медицинскую помощь." },
        { id: "term", title: "Срок действия и\u00a0изменение оферты", todo: "" },
        { id: "details", title: "Реквизиты исполнителя", body: <p>См. страницу <Link href="/legal/requisites">«Реквизиты»</Link>.</p> },
      ]}
    />
  );
}
