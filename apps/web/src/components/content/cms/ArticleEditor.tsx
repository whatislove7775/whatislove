"use client";

import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import { Badge, Button, Card, Input, Textarea, useToast } from "@/ui";
import { ApiError } from "@/lib/api/client";
import { contentAdminApi, slugify, TOPICS, type ArticleDraft, type Cover, type EvidenceLevel, type KeyFact, type Source } from "@/lib/api/content";
import { cleanFacts, cleanSources, EvidenceFields } from "./EvidenceFields";
import { ArticleCard } from "../Cards";
import { CoverUploader } from "@/components/media/CoverUploader";
import type { CoverImage } from "@/lib/api/authoring";
import { estimateMinutes, MarkdownBody } from "./MarkdownBody";
import { CoverPicker, fieldError, Select, Switch } from "./fields";
import s from "./cms.module.css";

type Form = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  topic: string;
  tags: string;
  cover: Cover;
  cover_image: CoverImage | null;
  emoji: string;
  reading_minutes: number;
  author_name: string;
  /** YYYY-MM-DD in the editor's local time; "" = set on publish */
  published_date: string;
  is_published: boolean;
  evidence_level: EvidenceLevel;
  when_to_seek_help: string;
  sources: Source[];
  key_facts: KeyFact[];
};

function toForm(a: ArticleDraft | null): Form {
  return {
    title: a?.title ?? "",
    slug: a?.slug ?? "",
    summary: a?.summary ?? "",
    body: a?.body ?? "",
    topic: a?.topic ?? "therapy",
    tags: (a?.tags ?? []).join(", "),
    cover: a?.cover ?? "sky",
    cover_image: a?.cover_image ?? null,
    emoji: a?.emoji ?? "",
    reading_minutes: a?.reading_minutes ?? 5,
    // New article: empty → the API fills in the editor's name (or «Редакция Aprosop»).
    author_name: a?.author_name ?? "",
    published_date: localDate(a?.published_at ?? null),
    is_published: a?.is_published ?? false,
    evidence_level: a?.evidence_level ?? "",
    when_to_seek_help: a?.when_to_seek_help ?? "",
    sources: a?.sources ?? [],
    key_facts: a?.key_facts ?? [],
  };
}

function localDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export { estimateMinutes };

export function ArticleEditor({
  article,
  onSaved,
  onDeleted,
}: {
  article: ArticleDraft | null;
  onSaved: (a: ArticleDraft) => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [f, setF] = useState<Form>(() => toForm(article));
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = JSON.stringify(f) !== JSON.stringify(toForm(article));

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const onTitle = (title: string) => {
    setF((x) => ({ ...x, title, slug: slugTouched ? x.slug : slugify(title) }));
  };

  const save = async (publish?: boolean) => {
    setBusy(true);
    setErrors({});
    const body: Partial<ArticleDraft> = {
      title: f.title.trim(),
      slug: f.slug.trim(),
      summary: f.summary.trim(),
      body: f.body,
      topic: f.topic,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      cover: f.cover,
      // Only send the cover when it changed (id, or null to remove)
      ...((f.cover_image?.id ?? null) !== (article?.cover_image?.id ?? null) ? { cover_image_id: f.cover_image?.id ?? null } : {}),
      emoji: f.emoji.trim(),
      reading_minutes: Number(f.reading_minutes) || estimateMinutes(f.body),
      author_name: f.author_name.trim(),
      is_published: publish ?? f.is_published,
      // Only send the date when the editor changed it, so the original publish time is kept.
      ...(f.published_date !== localDate(article?.published_at ?? null)
        ? { published_at: f.published_date ? new Date(`${f.published_date}T12:00:00`).toISOString() : null }
        : {}),
      evidence_level: f.evidence_level,
      when_to_seek_help: f.when_to_seek_help,
      sources: cleanSources(f.sources),
      key_facts: cleanFacts(f.key_facts),
    };
    try {
      const saved = article
        ? await contentAdminApi.updateArticle(article.id, body)
        : await contentAdminApi.createArticle(body);
      setF(toForm(saved));
      toast(publish === true ? "Статья опубликована" : publish === false ? "Статья снята с\u00a0публикации" : "Изменения сохранены");
      onSaved(saved);
    } catch (e) {
      if (e instanceof ApiError) {
        setErrors(e.fields);
        toast(e.message, { error: true });
      } else toast("Не\u00a0получилось сохранить. Попробуйте ещё раз.", { error: true });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!article) return;
    setBusy(true);
    try {
      await contentAdminApi.deleteArticle(article.id);
      toast("Статья удалена");
      onDeleted();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Не\u00a0получилось удалить", { error: true });
      setBusy(false);
    }
  };

  const err = (k: string) => fieldError(errors, k);
  const previewCard = {
    id: 0,
    slug: f.slug || "preview",
    title: f.title || "Заголовок статьи",
    summary: f.summary,
    topic: f.topic,
    topic_label: TOPICS.find((t) => t.value === f.topic)?.label ?? "",
    tags: [],
    cover: f.cover,
    cover_image: f.cover_image,
    emoji: f.emoji,
    reading_minutes: Number(f.reading_minutes) || 1,
    author_name: f.author_name,
    published_at: f.published_date ? new Date(`${f.published_date}T12:00:00`).toISOString() : null,
  };

  return (
    <div className={s.editor}>
      <div className={s.main}>
        <Card as="section">
          <div className={s.grid}>
            <Input label="Заголовок" value={f.title} onChange={(e) => onTitle(e.target.value)} error={err("title")} placeholder="Например: Как&nbsp;справиться с&nbsp;тревогой" />
            <Input
              label="Адрес"
              value={f.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
              error={err("slug")}
              hint={`/articles/${f.slug || "…"}`}
            />
            <div className={s.full}>
              <Textarea
                label="Короткое описание"
                value={f.summary}
                onChange={(e) => set("summary", e.target.value)}
                error={err("summary")}
                rows={2}
                maxLength={400}
                hint="Показывается в&nbsp;карточке и&nbsp;под&nbsp;заголовком, до&nbsp;400&nbsp;знаков"
              />
            </div>
            <Select label="Тема" value={f.topic} onChange={(v) => set("topic", v)} options={TOPICS} error={err("topic")} />
            <Input label="Теги" value={f.tags} onChange={(e) => set("tags", e.target.value)} error={err("tags")} hint="Через запятую" />
            <CoverPicker value={f.cover} onChange={(v) => set("cover", v)} error={err("cover")} />
            <div className={s.full}>
              <CoverUploader value={f.cover_image} onChange={(v) => set("cover_image", v)} error={err("cover_image_id")} />
            </div>
            <div className={s.pair}>
              <Input label="Эмодзи" value={f.emoji} onChange={(e) => set("emoji", e.target.value)} maxLength={8} error={err("emoji")} />
              <Input
                label="Минут чтения"
                type="number"
                min={1}
                max={90}
                value={f.reading_minutes}
                onChange={(e) => set("reading_minutes", Number(e.target.value))}
                error={err("reading_minutes")}
              />
            </div>
          </div>
        </Card>

        <MarkdownBody
          value={f.body}
          onChange={(v) => set("body", v)}
          error={err("body")}
          footer={
            <>
              <span>Markdown: ## подзаголовок, - список, **жирный**, &gt; врезка</span>
              <button type="button" className={s.linkBtn} onClick={() => set("reading_minutes", estimateMinutes(f.body))}>
                Посчитать время чтения ({estimateMinutes(f.body)} мин)
              </button>
            </>
          }
        />
        <EvidenceFields
          level={f.evidence_level}
          onLevel={(v) => set("evidence_level", v)}
          sources={f.sources}
          onSources={(v) => set("sources", v)}
          facts={f.key_facts}
          onFacts={(v) => set("key_facts", v)}
          errors={err}
        >
          <Textarea
            label="Когда нужен специалист"
            value={f.when_to_seek_help}
            onChange={(e) => set("when_to_seek_help", e.target.value)}
            error={err("when_to_seek_help")}
            rows={5}
            hint="Markdown-список признаков. Строка про&nbsp;112&nbsp;добавляется автоматически."
          />
        </EvidenceFields>
      </div>

      <aside className={s.side}>
        <Card as="section">
          <div className={s.status}>
            <span>Статус</span>
            {article?.is_published ? <Badge tone="success">Опубликована</Badge> : <Badge>Черновик</Badge>}
            {dirty && <Badge tone="warning">Есть изменения</Badge>}
          </div>
          <div className={s.byline}>
          <Input
            label="Редактор"
            value={f.author_name}
            onChange={(e) => set("author_name", e.target.value)}
            error={err("author_name")}
            placeholder="Ваше имя"
            hint={article ? undefined : "Пусто\u00a0— подставим ваше имя"}
          />
          <Input
            label="Дата публикации"
            type="date"
            value={f.published_date}
            onChange={(e) => set("published_date", e.target.value)}
            error={err("published_at")}
            hint={f.published_date ? undefined : "Поставим при\u00a0публикации"}
          />
          </div>
          <div className={s.actions}>
            {article?.is_published ? (
              <>
                <Button variant="primary" block loading={busy} onClick={() => save()} disabled={!dirty}>
                  Сохранить
                </Button>
                <Button variant="secondary" block disabled={busy} onClick={() => save(false)}>
                  Снять с&nbsp;публикации
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" block loading={busy} onClick={() => save(true)}>
                  Опубликовать
                </Button>
                <Button variant="secondary" block disabled={busy} onClick={() => save(false)}>
                  Сохранить черновик
                </Button>
              </>
            )}
            {article?.is_published && (
              <Button variant="ghost" block href={`/articles/${article.slug}`} icon={<Eye size={18} strokeWidth={1.8} />}>
                Открыть на&nbsp;сайте
              </Button>
            )}
          </div>
        </Card>
        <div className={s.cardPreview}>
          <span className={s.sideLabel}>Так выглядит карточка</span>
          <ArticleCard a={previewCard} />
        </div>
        {article && (
          <div className={s.danger}>
            {confirmDelete ? (
              <>
                <span>Удалить статью навсегда?</span>
                <div className={s.dangerBtns}>
                  <Button variant="danger" size="sm" loading={busy} onClick={remove}>
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

export { ToolBtn } from "./MarkdownBody";
