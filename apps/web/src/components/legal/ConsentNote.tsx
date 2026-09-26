import Link from "next/link";
import s from "./consent.module.css";

/**
 * Small print under a submit button that links the documents the user accepts.
 * kind: signup (client), specialist (application), payment (balance top-up).
 */
export function ConsentNote({ kind, action }: { kind: "signup" | "specialist" | "payment"; action: string }) {
  if (kind === "payment") {
    return (
      <p className={s.note}>
        Нажимая «{action}», вы&nbsp;принимаете условия <Link href="/legal/offer">публичной оферты</Link> и{" "}
        <Link href="/legal/refunds">правила возврата</Link>.
      </p>
    );
  }
  return (
    <p className={s.note}>
      Нажимая «{action}», вы&nbsp;принимаете <Link href="/legal/terms">пользовательское соглашение</Link>
      {kind === "specialist" && (
        <>
          , <Link href="/legal/specialist-agreement">договор со&nbsp;специалистом</Link>
        </>
      )}{" "}
      и&nbsp;даёте <Link href="/legal/personal-data">согласие на&nbsp;обработку персональных данных</Link> в&nbsp;соответствии с{" "}
      <Link href="/legal/privacy">политикой конфиденциальности</Link>.
    </p>
  );
}
