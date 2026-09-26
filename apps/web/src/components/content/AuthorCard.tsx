"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button, useToast } from "@/ui";
import { SpecialistPhoto } from "@/components/avatar/SpecialistPhoto";
import { useAuth } from "@/lib/auth/store";
import { dialogsApi } from "@/lib/api/dialogs";
import { ApiError } from "@/lib/api/client";
import { countRead } from "@/lib/api/authoring";
import type { Article } from "@/lib/api/content";
import { typo } from "@/lib/typography";
import { plural } from "@/lib/format";
import s from "./author.module.css";

/**
 * «Автор статьи» — specialist who wrote it: photo, name, a short bio, profile link and «Написать».
 * Guests go through /start and come back to the profile.
 */
export function AuthorCard({ specialist: p }: { specialist: NonNullable<Article["specialist"]> }) {
  const { user, status, bootstrap } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  useEffect(() => void bootstrap(), [bootstrap]);

  const profile = `/app/specialists/${p.id}`;
  const isClient = status === "authed" && user?.role === "client";
  const guestHref = `/start?next=${encodeURIComponent(profile)}`;

  const write = async () => {
    setBusy(true);
    try {
      const d = await dialogsApi.startWithSpecialist(p.id);
      router.push(`/app/dialogs?d=${encodeURIComponent(d.id)}`);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Не\u00a0получилось начать диалог", { error: true });
      setBusy(false);
    }
  };

  const meta = [
    p.experience_years ? `опыт ${p.experience_years} ${plural(p.experience_years, "год", "года", "лет")}` : "",
    ...(p.specializations ?? []).slice(0, 2).map((x) => x.toLowerCase()),
  ].filter(Boolean);

  return (
    <aside className={s.card} aria-label="Автор статьи">
      <Link href={status === "authed" ? profile : guestHref} className={s.photo} tabIndex={-1} aria-hidden>
        <SpecialistPhoto url={p.photo_url} name={p.name} size={64} alt="" />
      </Link>
      <div className={s.body}>
        <span className={s.label}>Автор&nbsp;— специалист Aprosop</span>
        <Link href={status === "authed" ? profile : guestHref} className={s.name}>
          {p.name}
        </Link>
        {meta.length > 0 && <span className={s.meta}>{meta.join(" · ")}</span>}
        {p.bio && <p className={s.bio}>{typo(p.bio)}</p>}
        <div className={s.actions}>
          {isClient ? (
            <Button variant="primary" size="sm" loading={busy} onClick={write} icon={<MessageCircle size={16} strokeWidth={1.8} />}>
              Начать диалог
            </Button>
          ) : status !== "authed" ? (
            <Button variant="primary" size="sm" href={guestHref} icon={<MessageCircle size={16} strokeWidth={1.8} />}>
              Начать диалог
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" href={status === "authed" ? profile : guestHref}>
            Профиль
          </Button>
        </div>
      </div>
    </aside>
  );
}

/** Counts one read per page view (after a few seconds on the page). */
export function ReadCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const t = setTimeout(() => countRead(slug), 5000);
    return () => clearTimeout(t);
  }, [slug]);
  return null;
}
