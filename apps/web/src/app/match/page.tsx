import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { MatchQuiz } from "@/components/matching/MatchQuiz";
import { MagnifierFind } from "@/components/illustrations";
import { alternates } from "@/lib/seo";
import { ogMeta } from "@/lib/og/sections";
import s from "@/components/matching/matchPage.module.css";

const TITLE = "Подбор психолога по\u00a0анкете";
const DESCRIPTION =
  "Пять коротких вопросов о\u00a0том, что\u00a0беспокоит, каким должен быть специалист и\u00a0когда удобно. Покажем, кто подходит и\u00a0почему. Без\u00a0регистрации, ответы не\u00a0сохраняются.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: alternates("/match"),
  ...ogMeta("/match", "Подбор психолога", DESCRIPTION),
};

export default function PublicMatchPage() {
  return (
    <PublicShell narrow>
      <header className={`${s.head} ${s.headWithArt}`}>
        <div className={s.head}>
          <h1 className={s.title}>Подберём психолога за&nbsp;пару минут</h1>
          <p className={s.sub}>Пять коротких вопросов&nbsp;— и&nbsp;вы&nbsp;увидите, кто подходит и&nbsp;почему. Без&nbsp;регистрации.</p>
        </div>
        <MagnifierFind className={s.headArt} />
      </header>
      <MatchQuiz mode="public" />
    </PublicShell>
  );
}
