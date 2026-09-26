"use client";

import { ArrowLeft, HeartHandshake, Lock, Sparkles, XCircle } from "lucide-react";
import { HelpLine } from "@/components/client/HelpLine";
import { useState } from "react";
import { Button, useToast } from "@/ui";
import { chatApi, type AIStatus } from "@/lib/api/chat";
import { Tisha } from "./Tisha";
import s from "./chat.module.css";
import { SearchTrigger } from "@/components/search/SpecialistSearch";

/** Знакомство с Тишей + явное согласие перед первым использованием. */
export function AIIntro({
  status,
  onConsent,
  onBack,
}: {
  status: AIStatus | null;
  onConsent: (st: AIStatus) => void;
  onBack: () => void;
}) {
  const toast = useToast();
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const enabled = !!status?.enabled;

  const accept = async () => {
    setBusy(true);
    try {
      onConsent(await chatApi.aiConsent());
    } catch {
      toast("Не\u00a0получилось сохранить согласие", { error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${s.view} ${s.introView}`} aria-label="Знакомство с&nbsp;Тишей">
      <header className={`${s.viewHead} ${s.introHead}`}>
        <button type="button" className={`${s.iconBtn} ${s.backBtn}`} onClick={onBack} aria-label="Назад к&nbsp;списку чатов">
          <ArrowLeft size={20} />
        </button>
      </header>
      <div className={s.intro}>
        <div className={s.introHero}>
          <div className={s.introMascot}>
            <Tisha size={96} state={enabled ? "idle" : "sleep"} />
          </div>
          <h2 className={s.introTitle}>{enabled ? "Знакомьтесь, это\u00a0Тиша" : "Тиша скоро появится"}</h2>
          <p className={s.introLead}>
            {enabled
              ? "ИИ-помощник, который рядом в\u00a0любое время."
              : "Мы\u00a0готовим ИИ-помощника. А\u00a0пока можно написать специалисту или\u00a0в\u00a0поддержку."}
          </p>
        </div>

        <ul className={s.introPoints}>
          <li>
            <Sparkles size={16} aria-hidden /> Выслушает, поможет разобрать мысли и&nbsp;подберёт практику
          </li>
          <li>
            <XCircle size={16} aria-hidden /> Не&nbsp;психолог и&nbsp;не&nbsp;врач, диагнозов не&nbsp;ставит
          </li>
          <li>
            <Lock size={16} aria-hidden /> Текст обрабатывает ИИ&nbsp;Claude (Anthropic) без&nbsp;псевдонима и&nbsp;данных аккаунта.
            Не&nbsp;пишите имён и&nbsp;адресов.
          </li>
        </ul>
        <HelpLine className={s.introHelp} />

        {enabled ? (
          <div className={s.consent}>
            <label className={s.consentLabel}>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                Понимаю, что&nbsp;Тиша&nbsp;— ИИ, и&nbsp;согласен(на) на&nbsp;обработку сообщений ИИ-провайдером. Отозвать можно в&nbsp;меню
                чата.
              </span>
            </label>
            <Button variant="primary" size="lg" disabled={!agree} loading={busy} onClick={accept} icon={<HeartHandshake size={20} />}>
              Начать разговор
            </Button>
          </div>
        ) : (
          <div className={s.consent}>
            <SearchTrigger variant="secondary" size="lg">
              Выбрать специалиста
            </SearchTrigger>
          </div>
        )}
      </div>
    </section>
  );
}
