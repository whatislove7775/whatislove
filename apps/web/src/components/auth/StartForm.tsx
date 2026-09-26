"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { nicknameApi } from "@/lib/api/nickname";
import type { AuthResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/store";
import { Button, PasswordInput } from "@/ui";
import { Hello, KeyFriend } from "@/components/illustrations";
import { AuthCard, AuthLinks, AuthShell, safeNext } from "./AuthShell";
import { FormError } from "./FormError";
import { NicknameField, type NicknameState } from "./NicknameField";
import { RecoveryKeyReveal } from "./RecoveryKeyReveal";
import s from "./auth.module.css";
import { ConsentNote } from "@/components/legal/ConsentNote";

export function StartForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [nick, setNick] = useState<NicknameState>({ alias: "", ok: true, custom: false });
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AuthResponse | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    if (nick.custom && !nick.ok) {
      setError(nick.alias ? "Выберите другой ник или\u00a0сгенерируйте его." : "Введите ник или\u00a0сгенерируйте его.");
      return;
    }
    if (password.length < 8) {
      setFieldError("Пароль должен быть не\u00a0короче 8\u00a0символов.");
      return;
    }
    setBusy(true);
    try {
      const res = await nicknameApi.signup(password, nick.alias || undefined);
      setPassword("");
      setResult(res);
      window.scrollTo({ top: 0 });
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.fields.password?.[0]) setFieldError(apiErr.fields.password[0]);
      else if (apiErr?.fields.alias?.[0]) setError(`Ник: ${apiErr.fields.alias[0]}`);
      else setError(apiErr?.message ?? "Не\u00a0получилось создать аккаунт. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <AuthShell art={<KeyFriend />}>
        <RecoveryKeyReveal
          alias={result.user.alias}
          recoveryKey={result.recovery_key ?? ""}
          avatar={result.user.avatar_config}
          onContinue={() => {
            useAuth.getState().accept(result);
            // H1: «Подбор по анкете» → «Начать анонимно» brings the person back to their results
            const next = safeNext(new URLSearchParams(window.location.search).get("next"));
            router.push(next && next.startsWith("/app/") ? next : "/app/avatar?welcome=1");
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell art={<Hello />}>
      <AuthCard
        title="Начать анонимно"
        sub="Почта и&nbsp;телефон не&nbsp;нужны&nbsp;— только ник и&nbsp;пароль."
      >
        <form className={s.form} onSubmit={submit} noValidate>
          <NicknameField onChange={setNick} />
          <PasswordInput
            label="Пароль"
            hint="Не&nbsp;короче 8&nbsp;символов. Лучше фраза из&nbsp;нескольких слов."
            error={fieldError}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldError(null);
            }}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
          <FormError>{error}</FormError>
          <Button type="submit" variant="primary" size="lg" block loading={busy}>
            Создать анонимный аккаунт
          </Button>
          <ConsentNote kind="signup" action="Создать анонимный аккаунт" />
        </form>
      </AuthCard>
      <AuthLinks
        links={[
          { href: "/login", label: "Войти", prefix: "Уже есть аккаунт?" },
          { href: "/join", label: "Регистрация специалиста", prefix: "Вы\u00a0психолог?" },
        ]}
      />
    </AuthShell>
  );
}
