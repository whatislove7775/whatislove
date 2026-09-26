"use client";

import { Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardHead, useToast } from "@/ui";
import { Switch } from "@/components/pro/controls";
import { ApiError } from "@/lib/api/client";
import { chatApi } from "@/lib/api/chat";

/** Specialist setting «Принимать файлы от клиентов» (off by default; works only after a booked call). */
export function ChatFilesSetting() {
  const toast = useToast();
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    chatApi
      .settings()
      .then((r) => setValue(r.accept_client_files))
      .catch(() => setValue(false));
  }, []);

  const change = async (v: boolean) => {
    const prev = value;
    setValue(v);
    try {
      await chatApi.setSettings(v);
    } catch (e) {
      setValue(prev);
      toast(e instanceof ApiError ? e.message : "Не\u00a0получилось сохранить", { error: true });
    }
  };

  return (
    <Card as="section">
      <CardHead
        title="Принимать файлы от&nbsp;клиентов"
        sub="Фото и&nbsp;документы&nbsp;— только после записи на&nbsp;созвон"
        icon={<Paperclip size={20} />}
        action={
          value === null ? undefined : (
            <Switch checked={value} onChange={change} label="Принимать файлы от&nbsp;клиентов" />
          )
        }
      />
    </Card>
  );
}
