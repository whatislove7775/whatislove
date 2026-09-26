"use client";

import { useState } from "react";
import { Eye, Send, Trash2, Undo2 } from "lucide-react";
import { Badge, Button, Card, Input, Textarea, useToast } from "@/ui";
import { ApiError } from "@/lib/api/client";
import { TOPICS, type Cover, type Source } from "@/lib/api/content";
import { myArticlesApi, STATUS_LABEL, type ArticleStatus, type CoverImage, type MyArticle, type MyArticleInput } from "@/lib/api/authoring";
import { MarkdownBody } from "@/components/content/cms/MarkdownBody";
import { cleanSources, EvidenceFields } from "@/components/content/cms/EvidenceFields";
import { fieldError, Select } from "@/components/content/cms/fields";
import { ArticleCard } from "@/components/content/Cards";
import { CoverUploader } from "@/components/media/CoverUploader";
import s from "@/components/content/cms/cms.module.css";
import p from "./articles.module.css";

type Form = { title: string; summary: string; body: string; topic: string; sources: Source[]; cover_image: CoverImage | null };

const toForm = (a: MyArticle | null): Form => ({
  title: a?.title ?? "",
  summary: a?.summary ?? "",
  body: a?.body ?? "",
  topic: a?.topic ?? "anxiety",
  sources: a?.sources ?? [],
  cover_image: a?.cover_image ?? null,
});

export const STATUS_TONE: Record<ArticleStatus, "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const MIN_WORDS = 150;

/** Specialist-scoped article editor (/pro/articles): Markdown, topic, summary, cover, optional sources. */
export function SpecialistArticleEditor({
  article,
  name,
  photo,
  onSaved,
  onDeleted,
}: {
  article: MyArticle | null;
  name: string;
  photo: string | null;
  onSaved: (a: MyArticle) => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [f, setF] = useState<Form>(() => toForm(article));
  const [busy, setBusy] = useState<"save" | "submit" | "withdraw" | "delete" | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status: ArticleStatus = article?.status ?? "draft";
  const locked = status === "pending" || status === "approved";
  const dirty = JSON.stringify(f) !== JSON.stringify(toForm(article));
  const words = f.body.trim().split(/\s+/).filter(Boolean).length;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const err = (k: string) => fieldError(errors, k);

  const fail = (e: unknown) => {
    if (e instanceof ApiError) {
      setErrors(e.fields);
      toast(e.message, { error: true });
    } else toast("Не\u00a0получилось сохранить. Попробуйте ещё раз.", { error: true });
  };

  const persist = async (): Promise<MyArticle> => {
    const body: MyArticleInput = {
      title: f.title.trim(),
      summary: f.summary.trim(),
      body: f.body,
      topic: f.topic,
      sources: cleanSources(f.sources),
      ...((f.cover_image?.id ?? null) !== (article?.cover_image?.id ?? null) ? { cover_image_id: f.cover_image?.id ?? null } : {}),
    };
    const saved = article ? await myArticlesApi.update(article.id, body) : await myArticlesApi.create(body);
    setF(toForm(saved));
    return saved;
  };

  const save = async () => {
    setBusy("save");
    setErrors({});
    try {
      const saved = await persist();
      toast("Черновик сохранён");
      onSaved(saved);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    setBusy("submit");
    setErrors({});
    try {
      const saved = dirty || !article ? await persist() : article;
      const sent = await myArticlesApi.submit(saved.id);
      toast("Статья отправлена на\u00a0модерацию");
      onSaved(sent);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const withdraw = async () => {
    if (!article) return;
    setBusy("withdraw");
    try {
      const a = await myArticlesApi.withdraw(article.id);
      toast(status === "approved" ? "Статья снята с\u00a0публикации" : "Статья вернулась в\u00a0черновики");
      onSaved(a);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!article) return;
    setBusy("delete");
    try {
      await myArticlesApi.remove(article.id);
      toast("Статья удалена");
      onDeleted();
    } catch (e) {
      fail(e);
      setBusy(null);
    }
  };

  const preview = {
    id: 0,
    slug: article?.slug ?? "preview",
    title: f.title || "Заголовок статьи",
    summary: f.summary,
    topic: f.topic,
    topic_label: TOPICS.find((t) => t.value === f.topic)?.label ?? "",
    tags: [],
    cover: (article?.cover ?? "sky") as Cover,
    cover_image: f.cover_image,
    emoji: "",
    reading_minutes: Math.max(1, Math.round(words / 160)),
    author_name: name,
    published_at: article?.published_at ?? null,
    specialist: { id: 0, name, photo_url: photo },
  };

  return (
    <div className={s.editor}>
      <fieldset className={`${s.main} ${p.fieldset}`} disabled={locked}>
        {status === "rejected" && article?.moderation_comment && (
          <p className={p.comment} role="status">
            <strong>Комментарий редакции.</strong> {article.moderation_comment}
          </p>
        )}
        <Card as="section">
          <div className={s.grid}>
            <div className={s.full}>
              <Input label="Заголовок" value={f.title} onChange={(e) => set("title", e.target.value)} error={err("title")} maxLength={200} placeholder="Например: Как&nbsp;пережить тревожную ночь" />
            </div>
            <div className={s.full}>
              <Textarea
                label="Короткое описание"
                value={f.summary}
                onChange={(e) => set("summary", e.target.value)}
                error={err("summary")}
                rows={2}
                maxLength={400}
                hint="1–2&nbsp;предложения для&nbsp;карточки"
              />
            </div>
            <Select label="Тема" value={f.topic} onChange={(v) => set("topic", v)} options={TOPICS} error={err("topic")} />
            <div className={s.full}>
              <CoverUploader value={f.cover_image} onChange={(v) => set("cover_image", v)} error={err("cover_image_id")} />
            </div>
          </div>
        </Card>
        <MarkdownBody
          value={f.body}
          onChange={(v) => set("body", v)}
          error={err("body")}
          footer={
            <span>
              {words} {words % 10 === 1 && words % 100 !== 11 ? "слово" : "слов"}
              {words < MIN_WORDS ? ` · для\u00a0модерации нужно от\u00a0${MIN_WORDS}` : ` · ≈${Math.max(1, Math.round(words / 160))} мин чтения`}
            </span>
          }
        />
        <EvidenceFields
          title="Источники"
          sub="Необязательно. Исследования и&nbsp;книги, на&nbsp;которые вы&nbsp;опираетесь; в&nbsp;тексте&nbsp;— [1], [2]."
          sources={f.sources}
          onSources={(v) => set("sources", v)}
          errors={err}
        />
      </fieldset>

      <aside className={s.side}>
        <Card as="section">
          <div className={s.status}>
            <span>Статус</span>
            <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
            {dirty && !locked && <Badge tone="warning">Есть изменения</Badge>}
          </div>
          <p className={p.note}>
            {status === "pending"
              ? "Редакция проверит статью и\u00a0опубликует её\u00a0или\u00a0вернёт с\u00a0комментарием."
              : status === "approved"
                ? `Опубликована${article?.reads ? ` · ${article.reads} прочтений` : ""}. Чтобы изменить текст, снимите её\u00a0с\u00a0публикации.`
                : "После модерации статья появится в\u00a0ленте «От\u00a0специалистов» с\u00a0вашим именем, фото и\u00a0ссылкой на\u00a0профиль."}
          </p>
          <div className={s.actions}>
            {!locked && (
              <>
                <Button variant="primary" block loading={busy === "submit"} disabled={!!busy} onClick={submit} icon={<Send size={16} />}>
                  Отправить на&nbsp;модерацию
                </Button>
                <Button variant="secondary" block loading={busy === "save"} disabled={!!busy || (!dirty && !!article)} onClick={save}>
                  Сохранить черновик
                </Button>
              </>
            )}
            {status === "approved" && article && (
              <Button variant="ghost" block href={`/app/articles/${article.slug}`} icon={<Eye size={16} />}>
                Открыть статью
              </Button>
            )}
            {locked && (
              <Button variant="secondary" block loading={busy === "withdraw"} disabled={!!busy} onClick={withdraw} icon={<Undo2 size={16} />}>
                {status === "approved" ? "Снять с\u00a0публикации" : "Вернуть в\u00a0черновики"}
              </Button>
            )}
          </div>
        </Card>
        <div className={s.cardPreview}>
          <span className={s.sideLabel}>Так выглядит карточка</span>
          <ArticleCard a={preview} />
        </div>
        {article && (
          <div className={s.danger}>
            {confirmDelete ? (
              <>
                <span>Удалить статью навсегда?</span>
                <div className={s.dangerBtns}>
                  <Button variant="danger" size="sm" loading={busy === "delete"} onClick={remove}>
                    Удалить
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                    Отмена
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} icon={<Trash2 size={16} strokeWidth={1.8} />}>
                Удалить статью
              </Button>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
