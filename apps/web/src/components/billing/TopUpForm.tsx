"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, FlaskConical, Lock } from "lucide-react";
import { Button, Input } from "@/ui";
import { ApiError } from "@/lib/api/client";
import { billingApi, rubK, type TopUp, type TopUpSettings } from "@/lib/api/billing";
import s from "./billing.module.css";
import { ConsentNote } from "@/components/legal/ConsentNote";

type ReceiptMode = "none" | "email" | "phone";

declare global {
  interface Window {
    YooMoneyCheckoutWidget?: new (opts: Record<string, unknown>) => { render: (id: string) => Promise<void>; destroy: () => void };
  }
}

/**
 * Top up the anonymous balance: preset or custom amount, payment method,
 * optional contact for the fiscal receipt (sent to YooKassa only, never stored).
 * Redirects to the provider (or our test checkout), or renders the YooKassa widget.
 */
export function TopUpForm({
  settings,
  suggestRub,
  returnTo,
  onDone,
}: {
  settings: TopUpSettings;
  /** preselected amount, e.g. the shortfall for a call */
  suggestRub?: number;
  /** our page to come back to after paying (must start with /app/) */
  returnTo?: string;
  onDone?: (t: TopUp) => void;
}) {
  const min = settings.min_kopecks / 100;
  const max = settings.max_kopecks / 100;
  const initial = useMemo(() => {
    if (suggestRub) return Math.min(max, Math.max(min, Math.ceil(suggestRub / 100) * 100));
    return settings.presets_rub[1] ?? settings.presets_rub[0] ?? 1000;
  }, [suggestRub, settings, min, max]);
  const [amount, setAmount] = useState<string>(String(initial));
  const [method, setMethod] = useState(settings.methods[0]?.id ?? "any");
  const [receipt, setReceipt] = useState<ReceiptMode>(settings.receipts.required ? "email" : "none");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetToken, setWidgetToken] = useState<string | null>(null);
  const widgetRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => setAmount(String(initial)), [initial]);

  const value = Number(amount.replace(/\s/g, "").replace(",", "."));
  const valid = Number.isFinite(value) && value >= min && value <= max;
  const presets = suggestRub && !settings.presets_rub.includes(initial) ? [initial, ...settings.presets_rub] : settings.presets_rub;

  useEffect(() => {
    if (!widgetToken) return;
    let cancelled = false;
    const start = () => {
      if (cancelled || !window.YooMoneyCheckoutWidget) return;
      const w = new window.YooMoneyCheckoutWidget({
        confirmation_token: widgetToken,
        return_url: `${window.location.origin}${returnTo ?? "/app/balance"}`,
        error_callback: () => setError("Платёжная форма не\u00a0загрузилась. Обновите страницу."),
      });
      widgetRef.current = w;
      w.render("yookassa-widget");
    };
    if (window.YooMoneyCheckoutWidget) start();
    else {
      const sc = document.createElement("script");
      sc.src = "https://yookassa.ru/checkout-widget/v1/checkout-widget.js";
      sc.onload = start;
      sc.onerror = () => setError("Платёжная форма не\u00a0загрузилась. Проверьте интернет.");
      document.head.appendChild(sc);
    }
    return () => {
      cancelled = true;
      widgetRef.current?.destroy();
    };
  }, [widgetToken, returnTo]);

  const submit = async () => {
    if (!valid) {
      setError(`Сумма\u00a0— от\u00a0${rubK(settings.min_kopecks)} до\u00a0${rubK(settings.max_kopecks)}.`);
      return;
    }
    if (receipt !== "none" && !contact.trim()) {
      setError(receipt === "email" ? "Укажите email для\u00a0чека или\u00a0выберите «Без\u00a0чека на\u00a0почту»." : "Укажите телефон для\u00a0чека.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const t = await billingApi.createTopUp({
        amount_rub: value,
        method,
        receipt_email: receipt === "email" ? contact.trim() : undefined,
        receipt_phone: receipt === "phone" ? contact.trim() : undefined,
        return_to: returnTo,
      });
      onDone?.(t);
      const c = t.confirmation;
      if (c?.type === "embedded" && c.token) {
        setWidgetToken(c.token);
        setBusy(false);
        return;
      }
      if (c?.url) {
        window.location.href = c.url;
        return;
      }
      setError("Платёжный сервис не\u00a0вернул ссылку. Попробуйте ещё раз.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не\u00a0получилось начать оплату. Попробуйте ещё раз.");
    }
    setBusy(false);
  };

  if (widgetToken) {
    return (
      <div className={s.stack}>
        <div id="yookassa-widget" className={s.widget} />
        {error && (
          <div className={s.error} role="alert">
            <AlertCircle size={16} aria-hidden /> {error}
          </div>
        )}
      </div>
    );
  }

  if (settings.providers.length === 0) {
    return (
      <div className={s.testNote}>
        <AlertCircle size={16} aria-hidden />
        <span>
          Пополнение картой и&nbsp;через СБП скоро появится. Сейчас баланс можно пополнить подарочным кодом&nbsp;— поле для&nbsp;кода
          ниже на&nbsp;этой странице.
        </span>
      </div>
    );
  }

  return (
    <div className={s.stack}>
      {settings.test_mode && (
        <div className={s.testNote}>
          <FlaskConical size={16} aria-hidden />
          <span>Тестовый режим: оплата проходит на&nbsp;нашей тестовой странице, настоящие деньги не&nbsp;списываются.</span>
        </div>
      )}

      <div>
        <div className={s.label} id="topup-amount">
          Сумма
        </div>
        <div className={s.presets} role="group" aria-labelledby="topup-amount">
          {presets.map((p) => (
            <button key={p} type="button" className={s.preset} aria-pressed={value === p} onClick={() => setAmount(String(p))}>
              {rubK(p * 100)}
            </button>
          ))}
        </div>
      </div>

      <label className={s.amountField}>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d\s,.]/g, ""))}
          aria-label="Другая сумма, рублей"
        />
        <span aria-hidden>₽</span>
      </label>
      <div className={s.hint}>
        От {rubK(settings.min_kopecks)} до {rubK(settings.max_kopecks)} за&nbsp;раз.
      </div>

      {settings.methods.length > 1 && (
        <div>
          <div className={s.label} id="topup-method">
            Способ оплаты
          </div>
          <div className={s.methods} role="group" aria-labelledby="topup-method">
            {settings.methods.map((m) => (
              <button key={m.id} type="button" className={s.method} aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {settings.receipts.enabled && (
        <fieldset className={s.receipt} style={{ border: 0, margin: 0 }}>
          <legend className={s.label} style={{ padding: 0 }}>
            Чек
          </legend>
          <div className={s.radios}>
            {!settings.receipts.required && (
              <label className={s.radio}>
                <input type="radio" name="receipt" checked={receipt === "none"} onChange={() => setReceipt("none")} />
                Без&nbsp;чека на&nbsp;почту
              </label>
            )}
            <label className={s.radio}>
              <input type="radio" name="receipt" checked={receipt === "email"} onChange={() => setReceipt("email")} />
              На&nbsp;email
            </label>
            <label className={s.radio}>
              <input type="radio" name="receipt" checked={receipt === "phone"} onChange={() => setReceipt("phone")} />
              По&nbsp;SMS
            </label>
          </div>
          {receipt !== "none" && (
            <Input
              type={receipt === "email" ? "email" : "tel"}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={receipt === "email" ? "mail@example.ru" : "+7 900 000-00-00"}
              aria-label={receipt === "email" ? "Email для\u00a0чека" : "Телефон для\u00a0чека"}
              autoComplete="off"
            />
          )}
          <div className={s.hint}>
            <Lock size={12} aria-hidden /> Контакт уходит только в&nbsp;ЮKassa для&nbsp;отправки чека и&nbsp;у&nbsp;нас не&nbsp;сохраняется. Можно
            указать любой ящик, не&nbsp;связанный с&nbsp;вами.
          </div>
        </fieldset>
      )}

      {error && (
        <div className={s.error} role="alert">
          <AlertCircle size={16} aria-hidden /> <span>{error}</span>
        </div>
      )}

      <Button variant="primary" size="lg" block loading={busy} disabled={!valid} onClick={submit}>
        {valid ? `Пополнить на\u00a0${rubK(Math.round(value * 100))}` : "Пополнить"}
      </Button>
      <div className={s.hint}>
        Платёжный сервис видит только сумму. Имя, карта и&nbsp;псевдоним к&nbsp;балансу не&nbsp;привязываются.
      </div>
      <ConsentNote kind="payment" action="Пополнить" />
    </div>
  );
}
