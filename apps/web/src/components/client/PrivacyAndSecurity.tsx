"use client";

/** Privacy & security settings: what we store, stealth mode, screenshot protection, password, device, delete account.
 *  Shared by /app/profile and the «Приватность» tab. */

import { useState, type FormEvent } from "react";
import { Check, LogOut, Minus, Trash2 } from "lucide-react";
import { Button, Card, CardHead, CollapsibleCard, Input, Modal, PasswordInput, useToast } from "@/ui";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/store";
import { errorText } from "@/components/client/useLoad";
import { clientStyles as cs } from "@/components/client/ClientBits";
import s from "@/app/app/avatar/privacy/privacy.module.css";
import { PrivacySettings } from "@/components/privacy/PrivacySettings";

const STORED = [
  { title: "Псевдоним", text: "Случайное имя, по\u00a0нему вы\u00a0входите" },
  { title: "Пароль", text: "Только в\u00a0виде хеша, прочитать его нельзя" },
  { title: "Настройки аватара", text: "Цвета и\u00a0формы, а\u00a0не\u00a0фотография" },
  {
    title: "Записи о\u00a0созвонах",
    text: "Дата, специалист и\u00a0сумма, чтобы вы\u00a0могли войти в\u00a0звонок",
  },
];
const NOT_STORED = [
  { title: "Имя, телефон и\u00a0почта", text: "Мы\u00a0их\u00a0не\u00a0спрашиваем" },
  {
    title: "Изображение с\u00a0камеры",
    text: "Оно превращается в\u00a0мимику аватара прямо на\u00a0устройстве",
  },
  { title: "Запись разговора", text: "Звонок идёт напрямую и\u00a0не\u00a0сохраняется" },
  {
    title: "Данные карты",
    text: "Их\u00a0обрабатывает платёжный сервис, у\u00a0нас их\u00a0нет",
  },
];

export function PrivacyAndSecurity() {
  const toast = useToast();
  const user = useAuth((st) => st.user);
  const logout = useAuth((st) => st.logout);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [repeat, setRepeat] = useState("");
  const [pwErr, setPwErr] = useState<{
    old?: string;
    next?: string;
    repeat?: string;
    form?: string;
  }>({});
  const [pwBusy, setPwBusy] = useState(false);

  const [delOpen, setDelOpen] = useState(false);
  const [delPw, setDelPw] = useState("");
  const [delErr, setDelErr] = useState<string | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof pwErr = {};
    if (!oldPw) errs.old = "Введите пароль, которым входите сейчас";
    if (newPw.length < 8) errs.next = "Нужно не\u00a0меньше 8\u00a0символов";
    else if (newPw === oldPw) errs.next = "Новый пароль совпадает с\u00a0текущим";
    if (repeat !== newPw)
      errs.repeat = "Пароли не\u00a0совпадают. Введите новый пароль ещё раз";
    setPwErr(errs);
    if (Object.keys(errs).length) return;
    setPwBusy(true);
    try {
      await authApi.changePassword(oldPw, newPw);
      setOldPw("");
      setNewPw("");
      setRepeat("");
      toast("Пароль изменён");
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setPwErr({
          old: err.fields.old_password?.[0],
          next: err.fields.new_password?.[0],
          form: err.fields.non_field_errors?.[0],
        });
      } else if (err instanceof ApiError && err.status === 400) {
        setPwErr({ old: err.message });
      } else setPwErr({ form: errorText(err) });
    } finally {
      setPwBusy(false);
    }
  };

  // Hard navigation: the cabinet guard would otherwise race us to /login.
  const leave = () => window.location.replace("/");

  const onLogout = () => {
    logout();
    leave();
  };

  const deleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    if (!delPw) {
      setDelErr("Введите пароль, чтобы подтвердить удаление");
      return;
    }
    setDelBusy(true);
    setDelErr(null);
    try {
      await authApi.deleteAccount(delPw);
      useAuth.getState().logout();
      leave();
    } catch (err) {
      setDelErr(
        err instanceof ApiError && err.status === 400
          ? "Пароль не\u00a0подошёл. Проверьте раскладку и\u00a0попробуйте снова"
          : errorText(err),
      );
      setDelBusy(false);
    }
  };

  return (
    <>
        <CollapsibleCard title="Что&nbsp;мы&nbsp;храним" defaultOpen={false}>
          <div className={s.columns}>
            <div className={s.col}>
              <h3 className={s.colTitle}>Храним</h3>
              <ul className={s.list}>
                {STORED.map((x) => (
                  <li key={x.title}>
                    <span className={s.markYes} aria-hidden>
                      <Check size={14} strokeWidth={2.6} />
                    </span>
                    <span>
                      <strong>{x.title}</strong>
                      <span>{x.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={s.col}>
              <h3 className={s.colTitle}>Не&nbsp;храним</h3>
              <ul className={s.list}>
                {NOT_STORED.map((x) => (
                  <li key={x.title}>
                    <span className={s.markNo} aria-hidden>
                      <Minus size={14} strokeWidth={2.6} />
                    </span>
                    <span>
                      <strong>{x.title}</strong>
                      <span>{x.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleCard>

        {/* «Незаметный режим» и «Защита от скриншотов» */}
        <PrivacySettings />

        <CollapsibleCard title="Сменить пароль" defaultOpen={false}>
          <form className={s.form} onSubmit={changePassword} noValidate>
            <PasswordInput
              label="Текущий пароль"
              autoComplete="current-password"
              value={oldPw}
              onChange={(e) => setOldPw(e.target.value)}
              error={pwErr.old}
            />
            <div className={s.pair}>
              <PasswordInput
                label="Новый пароль"
                autoComplete="new-password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                error={pwErr.next}
                hint="Не&nbsp;меньше 8&nbsp;символов"
              />
              <PasswordInput
                label="Новый пароль ещё раз"
                autoComplete="new-password"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                error={pwErr.repeat}
              />
            </div>
            {pwErr.form && (
              <p className={s.formErr} role="alert">
                {pwErr.form}
              </p>
            )}
            <div>
              <Button type="submit" variant="primary" loading={pwBusy}>
                Сменить пароль
              </Button>
            </div>
          </form>
        </CollapsibleCard>

        <Card as="section">
          <CardHead title="Это&nbsp;устройство" />
          <div className={s.settings}>
            <div className={s.setting}>
              <span>
                <strong>Тема оформления</strong>
              </span>
              <ThemeToggle />
            </div>
            <div className={s.setting}>
              <span>
                <strong>Выйти из&nbsp;аккаунта</strong>
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={onLogout}
                icon={<LogOut size={16} strokeWidth={1.8} />}
              >
                Выйти
              </Button>
            </div>
          </div>
        </Card>

        <section className={s.danger} aria-labelledby="danger-title">
          <div>
            <h2 id="danger-title">Удалить аккаунт и&nbsp;все данные</h2>
            <p>Восстановить будет нельзя, даже с&nbsp;ключом.</p>
          </div>
          <Button
            variant="danger"
            icon={<Trash2 size={18} strokeWidth={1.8} />}
            onClick={() => {
              setDelPw("");
              setDelErr(null);
              setDelOpen(true);
            }}
          >
            Удалить аккаунт
          </Button>
        </section>

      <Modal
        open={delOpen}
        onClose={() => !delBusy && setDelOpen(false)}
        title="Удалить аккаунт навсегда?"
        width={480}
      >
        <form onSubmit={deleteAccount} noValidate>
          <p className={cs.modalText}>
            Мы&nbsp;сотрём псевдоним <strong>{user?.alias}</strong>, аватар, диалоги
            и&nbsp;созвоны. Запланированные созвоны тоже отменятся. Чтобы подтвердить,
            введите пароль.
          </p>
          <div style={{ marginTop: 16 }}>
            <PasswordInput
              label="Пароль"
              autoComplete="current-password"
              value={delPw}
              onChange={(e) => setDelPw(e.target.value)}
              error={delErr ?? undefined}
            />
          </div>
          <div className={cs.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDelOpen(false)}
              disabled={delBusy}
            >
              Оставить аккаунт
            </Button>
            <Button type="submit" variant="danger" loading={delBusy}>
              Удалить навсегда
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
