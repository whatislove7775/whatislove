import Link from "next/link";
import { DraftDoc } from "@/components/legal/DraftDoc";
import { legalMetadata } from "@/components/legal/meta";

export const metadata = legalMetadata("specialist-agreement");

export default function SpecialistAgreementPage() {
  return (
    <DraftDoc
      slug="specialist-agreement"
      summary={
        <p>
          <strong>Коротко.</strong> Условия работы специалистов на&nbsp;площадке: проверка анкеты, конфиденциальность клиентов,
          комиссия сервиса и&nbsp;выплаты. Анкета&nbsp;— на&nbsp;странице <Link href="/join">«Стать специалистом»</Link>.
        </p>
      }
      sections={[
        { id: "parties", title: "Стороны и\u00a0предмет договора", todo: "" },
        {
          id: "verification",
          title: "Проверка специалиста",
          body: <p>Профиль появляется в&nbsp;каталоге только после ручной проверки образования и&nbsp;опыта.</p>,
          todo: "Перечень документов и\u00a0порядок проверки.",
        },
        {
          id: "confidentiality",
          title: "Конфиденциальность клиентов",
          body: (
            <p>
              Специалист не&nbsp;пытается установить личность клиента, не&nbsp;записывает созвоны и&nbsp;соблюдает профессиональную
              этику.
            </p>
          ),
          todo: "",
        },
        { id: "fees", title: "Стоимость, комиссия и\u00a0выплаты", todo: "Размер комиссии, график и\u00a0способ выплат, налоговый статус специалиста." },
        { id: "cancellations", title: "Отмены и\u00a0неявки", todo: "" },
        { id: "termination", title: "Приостановка и\u00a0расторжение", todo: "" },
        { id: "liability", title: "Ответственность сторон", todo: "" },
      ]}
    />
  );
}
