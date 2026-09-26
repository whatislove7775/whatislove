"use client";

import { Info, SlidersHorizontal } from "lucide-react";
import { Card, CardHead, Skeleton, useToast } from "@/ui";
import { PageHeader, WithRail } from "@/components/shell/AppShell";
import { useLoad } from "@/components/client/useLoad";
import { ErrorBlock } from "@/components/client/ClientBits";
import { ProgramForm } from "@/components/business/ProgramForm";
import { businessApi } from "@/lib/api/business";
import s from "@/components/business/business.module.css";

export default function ProgramPage() {
  const toast = useToast();
  const data = useLoad(() => businessApi.program(), []);
  return (
    <>
      <PageHeader title="Программа" sub="Сколько компания оплачивает каждому сотруднику и&nbsp;за&nbsp;что." />
      {data.error ? (
        <ErrorBlock message={data.error} onRetry={data.reload} />
      ) : (
        <WithRail
          rail={
            <Card as="section">
              <CardHead title="Как&nbsp;списываются деньги" icon={<Info size={18} />} />
              <ul className={s.muted} style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
                <li>Созвон оплачивается сначала из&nbsp;программы, остаток&nbsp;— с&nbsp;личного баланса сотрудника.</li>
                <li>Деньги уходят из&nbsp;бюджета, только когда созвон состоялся. Отмена специалистом&nbsp;— полный возврат в&nbsp;бюджет.</li>
                <li>Лимит обновляется в&nbsp;начале каждого периода. Неиспользованный остаток не&nbsp;переносится и&nbsp;остаётся в&nbsp;бюджете компании.</li>
                <li>Если бюджет закончился, сотрудник может платить сам&nbsp;— программа снова заработает после пополнения.</li>
              </ul>
            </Card>
          }
        >
          <Card as="section">
            <CardHead title="Настройки" icon={<SlidersHorizontal size={18} />} />
            {!data.data ? (
              <Skeleton height={320} radius={14} />
            ) : !data.data.program ? (
              <p className={s.muted}>Программа ещё не&nbsp;настроена. Напишите менеджеру&nbsp;— он&nbsp;поможет подобрать лимиты.</p>
            ) : (
              <ProgramForm
                key={data.data.program.id}
                program={data.data.program}
                onSave={async (body) => {
                  const r = await businessApi.updateProgram(body);
                  data.setData({ ...data.data!, program: r.program });
                  toast("Программа сохранена");
                }}
              />
            )}
          </Card>
        </WithRail>
      )}
    </>
  );
}
