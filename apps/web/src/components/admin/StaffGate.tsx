"use client";

import { useState, type FormEvent } from "react";
import { Copy, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { Button, Card, CardHead, Input, PasswordInput, useToast } from "@/ui";
import { PageHeader } from "@/components/shell/AppShell";
import { staffApi, type StaffMe } from "@/lib/api/staff";
import { useAuth } from "@/lib/auth/store";
import s from "./staff.module.css";

/** Shown instead of the console until a one-time password is changed and (when required) 2FA is on. */
export function StaffGate({ me, onDone }: { me: StaffMe; onDone: () => Promise<void> }) {
  if (me.must_change_password) {
    return (
      <>
        <PageHeader
          title="Придумайте свой пароль"
          sub="Вы&nbsp;вошли по&nbsp;одноразовому паролю от&nbsp;администратора. Замените его, чтобы открыть консоль."
        />
        <div className={s.narrow}>
          <PasswordCard onDone={onDone} firstTime />
        </div>
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Включите двухфакторную защиту"
        sub={`Для\u00a0роли «${me.role_label.toLowerCase()}» вход только с\u00a0кодом из\u00a0приложения на\u00a0телефоне. Это\u00a0займёт минуту.`}
      />
      <div className={s.narrow}>
        <TotpCard enabled={false} required onDone={onDone} />
      </div>
    </>
  );
}

export function PasswordCard({ onDone, firstTime }: { onDone?: () => Promise<void> | void; firstTime?: boolean }) {
  const toast = useToast();
  const [oldPass, setOldPass] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 12) return setError("Новый пароль должен быть не\u00a0короче 12\u00a0символов.");
    if (next !== repeat) return setError("Пароли не\u00a0совпадают. Введите новый пароль ещё раз.");
    setBusy(true);
    try {
      const res = await staffApi.changePassword(oldPass, next);
      useAuth.getState().accept(res);
      toast("Пароль изменён. Другие устройства вышли из\u00a0аккаунта.");
      setOldPass("");
      setNext("");
      setRepeat("");
      await onDone?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card as="section">
      <CardHead
        icon={<KeyRound size={20} />}
        title={firstTime ? "Новый пароль" : "Сменить пароль"}
        sub="Не&nbsp;короче 12&nbsp;символов. После смены все остальные устройства выйдут из&nbsp;аккаунта."
      />
      <form className={s.form} onSubmit={submit} noValidate>
        <PasswordInput
          label={firstTime ? "Одноразовый пароль" : "Текущий пароль"}
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          autoComplete="current-password"
        />
        <PasswordInput label="Новый пароль" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
        <PasswordInput
          label="Новый пароль ещё раз"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          autoComplete="new-password"
          error={error ?? undefined}
        />
        <div>
          <Button type="submit" variant="primary" loading={busy} disabled={!oldPass || !next}>
            Сохранить пароль
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function TotpCard({
  enabled,
  required,
  onDone,
}: {
  enabled: boolean;
  required: boolean;
  onDone?: () => Promise<void> | void;
}) {
  const toast = useToast();
  const [setup, setSetup] = useState<{ secret: string; otpauth_url: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      setSetup(await staffApi.totpSetup());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (disabling) {
        await staffApi.totpDisable(code);
        toast("Двухфакторная защита выключена");
      } else {
        await staffApi.totpEnable(code);
        toast("Двухфакторная защита включена");
      }
      setSetup(null);
      setDisabling(false);
      setCode("");
      await onDone?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      toast("Ключ скопирован");
    } catch {
      toast("Не\u00a0получилось скопировать. Выделите ключ вручную.", { error: true });
    }
  };

  const codeInput = (
    <form className={s.form} onSubmit={confirm} noValidate>
      <Input
        label="Код из&nbsp;приложения"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        error={error ?? undefined}
      />
      <div className={s.row}>
        <Button type="submit" variant={disabling ? "danger" : "primary"} loading={busy} disabled={code.length !== 6}>
          {disabling ? "Выключить защиту" : "Подтвердить и\u00a0включить"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setSetup(null);
            setDisabling(false);
            setCode("");
            setError(null);
          }}
        >
          Отмена
        </Button>
      </div>
    </form>
  );

  return (
    <Card as="section">
      <CardHead
        icon={<ShieldCheck size={20} />}
        title="Двухфакторная защита"
        sub={
          enabled
            ? "Включена. При\u00a0входе нужен код из\u00a0приложения-аутентификатора."
            : "Вход по\u00a0паролю и\u00a0шестизначному коду из\u00a0приложения: Яндекс Ключ, Google Authenticator, 1Password и\u00a0другие."
        }
      />
      {enabled && !disabling && (
        <div className={s.row}>
          <span className={s.okPill}>
            <ShieldCheck size={16} /> Защита включена
          </span>
          {!required && (
            <Button variant="ghost" size="sm" onClick={() => setDisabling(true)}>
              Выключить
            </Button>
          )}
        </div>
      )}
      {enabled && disabling && codeInput}
      {!enabled && !setup && (
        <div className={s.row}>
          <Button variant="primary" icon={<Smartphone size={18} />} loading={busy} onClick={start}>
            Настроить
          </Button>
          {error && <span className={s.errorText}>{error}</span>}
        </div>
      )}
      {!enabled && setup && (
        <div className={s.totpSteps}>
          <ol className={s.steps}>
            <li>Откройте приложение-аутентификатор и&nbsp;выберите «Добавить вручную» или&nbsp;«Ввести ключ».</li>
            <li>Введите ключ ниже. Тип: по&nbsp;времени, 6&nbsp;цифр.</li>
            <li>Введите код, который покажет приложение.</li>
          </ol>
          <div className={s.secret}>
            <code aria-label="Секретный ключ">{setup.secret.match(/.{1,4}/g)?.join(" ")}</code>
            <Button variant="ghost" size="sm" iconOnly aria-label="Скопировать ключ" icon={<Copy size={16} />} onClick={copy} />
          </div>
          <a className={s.link} href={setup.otpauth_url}>
            Открыть в&nbsp;приложении на&nbsp;этом устройстве
          </a>
          {codeInput}
        </div>
      )}
    </Card>
  );
}
