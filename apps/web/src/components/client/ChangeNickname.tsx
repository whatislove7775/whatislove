"use client";

import { useEffect, useState } from "react";
import { Button, Modal, useToast } from "@/ui";
import { ApiError } from "@/lib/api/client";
import { nicknameApi } from "@/lib/api/nickname";
import { useAuth } from "@/lib/auth/store";
import { NicknameField, type NicknameState } from "@/components/auth/NicknameField";
import s from "./nickname.module.css";

/** Profile → «Сменить ник». Once a day; the old nickname isn't kept anywhere. */
export function ChangeNickname({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuth((st) => st.user);
  const toast = useToast();
  const [nick, setNick] = useState<NicknameState>({ alias: "", ok: false, custom: false });
  const [nextAt, setNextAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    nicknameApi
      .mine()
      .then((r) => setNextAt(r.next_change_at))
      .catch(() => setNextAt(null));
  }, [open]);

  if (!user) return null;
  const locked = !!nextAt && new Date(nextAt) > new Date();

  const save = async () => {
    if (!nick.ok || busy) return;
    setBusy(true);
    setError(null);
    try {
      const r = await nicknameApi.change(nick.alias);
      useAuth.setState({ user: r.user });
      toast(`Теперь вы\u00a0— ${r.alias}. Входите под\u00a0новым ником`);
      onClose();
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.fields.alias?.[0] ?? e.message);
        if (e.status === 429) nicknameApi.mine().then((r) => setNextAt(r.next_change_at)).catch(() => {});
      } else setError("Не\u00a0получилось сохранить. Попробуйте ещё раз");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Сменить ник" width={440}>
      {locked ? (
        <p className={s.note}>
          Ник можно менять раз в&nbsp;сутки. Следующая смена&nbsp;—{" "}
          {new Date(nextAt!).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}.
        </p>
      ) : (
        <div className={s.body}>
          <NicknameField key={user.alias} initial={user.alias} onChange={setNick} label="Новый ник" startCustom />
          <p className={s.note}>С&nbsp;новым ником вы&nbsp;входите в&nbsp;аккаунт. Специалисты увидят только его, прежний нигде не&nbsp;сохранится. Менять можно раз в&nbsp;сутки.</p>
          {error && (
            <p className={s.error} role="alert">
              {error}
            </p>
          )}
          <div className={s.actions}>
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button variant="primary" onClick={save} loading={busy} disabled={!nick.ok}>
              Сохранить
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
