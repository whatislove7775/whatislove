import { DraftDoc } from "@/components/legal/DraftDoc";
import { legalMetadata } from "@/components/legal/meta";

export const metadata = legalMetadata("refunds");

export default function RefundsPage() {
  return (
    <DraftDoc
      slug="refunds"
      summary={
        <p>
          <strong>Коротко.</strong> Здесь будут собраны правила: когда деньги за&nbsp;созвон возвращаются на&nbsp;баланс и&nbsp;как&nbsp;вывести неиспользованный остаток.
        </p>
      }
      sections={[
        { id: "cancel-client", title: "Если созвон отменяет клиент", todo: "Сроки бесплатной отмены и\u00a0удержания при\u00a0поздней отмене." },
        { id: "cancel-specialist", title: "Если созвон отменяет или\u00a0пропускает специалист", todo: "" },
        { id: "tech", title: "Технические проблемы во\u00a0время созвона", todo: "" },
        { id: "balance", title: "Возврат остатка баланса", todo: "Способ и\u00a0сроки возврата, анонимность при\u00a0возврате." },
        {
          id: "how",
          title: "Как\u00a0запросить возврат",
          body: (
            <p>
              Напишите на <a href="mailto:support@aprosop.ru">support@aprosop.ru</a> или&nbsp;в&nbsp;поддержку в&nbsp;кабинете и&nbsp;укажите
              имя на&nbsp;сервисе. Представляться не&nbsp;нужно.
            </p>
          ),
          todo: "Сроки рассмотрения обращений.",
        },
      ]}
    />
  );
}
