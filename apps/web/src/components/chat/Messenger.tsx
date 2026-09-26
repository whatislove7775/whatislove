"use client";

import { EyeOff, Lock, MessageCirclePlus, Mic, PencilLine, Search, Timer } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, EmptyState, Modal, Skeleton, useToast } from "@/ui";
import { ApiError } from "@/lib/api/client";
import { chatApi, type AIStatus, type Contact, type Conversation } from "@/lib/api/chat";
import { chatSocket } from "@/lib/chat/socket";
import { AIIntro } from "./AIIntro";
import { ConvAvatar } from "./ConvAvatar";
import { ConversationView } from "./ConversationView";
import { fmtTime } from "./MessageItem";
import s from "./chat.module.css";
import { ChatBubbles, EmptyArt } from "@/components/illustrations";
import art from "./art.module.css";
import { SearchTrigger } from "@/components/search/SpecialistSearch";

export type MessengerMode = "client" | "specialist" | "support";

const AI_KEY = "ai";
const SUPPORT_KEY = "support";

function when(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return fmtTime(iso);
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 6) return d.toLocaleDateString("ru-RU", { weekday: "short" });
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

const PRIVACY: Record<MessengerMode, string> = {
  client:
    "Переписка хранится в\u00a0зашифрованном виде. Специалист видит только ваш псевдоним и\u00a0аватар, а\u00a0сотрудники платформы не\u00a0имеют доступа к\u00a0вашим чатам со\u00a0специалистами.",
  specialist:
    "Клиент видит ваше имя из\u00a0профиля, вы\u00a0— только его псевдоним. Отправлять файлы в\u00a0чатах можете вы\u00a0и\u00a0поддержка. Переписка хранится в\u00a0зашифрованном виде.",
  support:
    "Здесь только обращения в\u00a0поддержку. Личные чаты клиентов и\u00a0специалистов сотрудникам недоступны. Клиента вы\u00a0видите только по\u00a0псевдониму.",
};

interface Entry {
  key: string;
  conv: Conversation | null;
  name: string;
  preview: string;
  time: string | null;
  unread: number;
  pinned?: boolean;
  who: Conversation["counterpart"];
}

export function Messenger({ mode }: { mode: MessengerMode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const toast = useToast();
  const selected = params?.get("c") ?? null;

  const [convs, setConvs] = useState<Conversation[] | null>(null);
  const [ai, setAi] = useState<AIStatus | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [query, setQuery] = useState("");
  const [opening, setOpening] = useState(false);

  const select = useCallback(
    (key: string | null) => {
      router.replace(key ? `${pathname}?c=${encodeURIComponent(key)}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const load = useCallback(async () => {
    try {
      const [list, st] = await Promise.all([
        chatApi.conversations(mode === "support" ? "support" : undefined),
        mode === "client" ? chatApi.ai().catch(() => null) : Promise.resolve(null),
      ]);
      setConvs(list);
      if (st) setAi(st);
    } catch (e) {
      setConvs((c) => c ?? []);
      toast(e instanceof ApiError ? e.message : "Не\u00a0получилось загрузить чаты", { error: true });
    }
  }, [mode, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => chatSocket.acquire(), []);

  // Keep the list fresh from realtime events
  useEffect(() => {
    return chatSocket.subscribe((e) => {
      if (e.type !== "message.new") return;
      const m = e.message;
      setConvs((list) => {
        if (!list) return list;
        const idx = list.findIndex((c) => c.id === m.conversation);
        if (idx < 0) {
          void load();
          return list;
        }
        const c = list[idx];
        const preview =
          m.kind === "voice" ? "Голосовое сообщение" : m.kind === "file" ? "Файл" : m.text.slice(0, 120);
        const isOpen = selected === c.id;
        const updated: Conversation = {
          ...c,
          last_message: { text: preview, created_at: m.created_at, sender_role: m.sender_role, kind: m.kind },
          last_message_at: m.created_at,
          unread: !m.mine && !isOpen && m.kind !== "system" ? c.unread + 1 : c.unread,
        };
        const next = list.slice();
        next.splice(idx, 1);
        return [updated, ...next];
      });
    });
  }, [load, selected]);

  const updateConv = useCallback((c: Conversation) => {
    setConvs((list) => (list ? list.map((x) => (x.id === c.id ? { ...x, ...c } : x)) : list));
  }, []);

  // Resolve pseudo keys ("support", "ai") to real conversations
  useEffect(() => {
    if (!convs) return;
    if (selected === SUPPORT_KEY && mode !== "support") {
      const existing = convs.find((c) => c.kind === "client_support" || c.kind === "specialist_support");
      if (existing) select(existing.id);
      else if (!opening) {
        setOpening(true);
        chatApi
          .start({ with: "support" })
          .then((c) => {
            setConvs((list) => [c, ...(list ?? []).filter((x) => x.id !== c.id)]);
            select(c.id);
          })
          .catch((e) => toast(e instanceof ApiError ? e.message : "Не\u00a0получилось открыть чат", { error: true }))
          .finally(() => setOpening(false));
      }
    }
    if (selected === AI_KEY && ai?.consent && ai.conversation_id && convs.some((c) => c.id === ai.conversation_id)) {
      select(ai.conversation_id);
    }
  }, [selected, convs, ai, mode, select, opening, toast]);

  const entries: Entry[] = useMemo(() => {
    if (!convs) return [];
    const toEntry = (c: Conversation, pinned = false): Entry => ({
      key: c.id,
      conv: c,
      name: c.counterpart.name,
      preview: c.last_message?.text ?? "",
      time: c.last_message_at,
      unread: c.unread,
      pinned,
      who: c.counterpart,
    });
    if (mode === "support") {
      const q = query.trim().toLowerCase();
      return convs.filter((c) => !q || c.counterpart.name.toLowerCase().includes(q)).map((c) => toEntry(c));
    }
    const out: Entry[] = [];
    if (mode === "client") {
      const aiConv = convs.find((c) => c.kind === "ai");
      out.push(
        aiConv && ai?.consent
          ? { ...toEntry(aiConv, true), key: aiConv.id }
          : {
              key: AI_KEY,
              conv: null,
              name: "Тиша",
              preview: ai?.enabled === false ? "ИИ-помощник скоро появится" : "ИИ-помощник для\u00a0поддержки и\u00a0практик",
              time: null,
              unread: 0,
              pinned: true,
              who: { type: "ai", name: "Тиша", avatar_config: null },
            },
      );
    }
    const support = convs.find((c) => c.kind === "client_support" || c.kind === "specialist_support");
    out.push(
      support
        ? toEntry(support, true)
        : {
            key: SUPPORT_KEY,
            conv: null,
            name: "Поддержка Aprosop",
            preview: "Вопросы по\u00a0оплате, записи и\u00a0работе сервиса",
            time: null,
            unread: 0,
            pinned: true,
            who: { type: "support", name: "Поддержка Aprosop", avatar_config: null },
          },
    );
    convs.filter((c) => c.kind === "specialist").forEach((c) => out.push(toEntry(c)));
    return out;
  }, [convs, ai, mode, query]);

  const active: Conversation | null =
    selected && convs ? convs.find((c) => c.id === selected) ?? null : null;
  const showAIIntro = mode === "client" && (selected === AI_KEY || (active?.kind === "ai" && !ai?.consent));
  const open = !!(active || showAIIntro || (selected && selected !== AI_KEY));

  const openNew = async () => {
    setNewOpen(true);
    if (!contacts) {
      try {
        setContacts(await chatApi.contacts());
      } catch {
        setContacts([]);
      }
    }
  };

  const startWith = async (c: Contact) => {
    try {
      const conv = await chatApi.start(
        c.type === "specialist"
          ? { with: "specialist", psychologist_id: c.psychologist_id! }
          : { with: "client", client_alias: c.client_alias! },
      );
      setConvs((list) => [conv, ...(list ?? []).filter((x) => x.id !== conv.id)]);
      setNewOpen(false);
      select(conv.id);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Не\u00a0получилось начать чат", { error: true });
    }
  };

  const title = mode === "support" ? "Поддержка" : "Чаты";

  return (
    <div className={s.messenger} data-open={open ? "" : undefined}>
      <aside className={s.listPane} aria-label="Список чатов">
        <div className={s.listHead}>
          <h1 className={s.listTitle}>{title}</h1>
          {mode !== "support" && (
            <Button variant="soft" size="sm" onClick={openNew} icon={<MessageCirclePlus size={18} />}>
              Новый чат
            </Button>
          )}
        </div>
        {mode === "support" && (
          <label className={s.search}>
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти по&nbsp;псевдониму или&nbsp;имени" />
          </label>
        )}
        <div className={s.list}>
          {!convs ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={s.item}>
                <Skeleton width={44} height={44} radius={22} />
                <div style={{ flex: 1, display: "grid", gap: 6 }}>
                  <Skeleton width="50%" height={14} />
                  <Skeleton width="80%" height={12} />
                </div>
              </div>
            ))
          ) : entries.length === 0 ? (
            <EmptyState art={<EmptyArt scene="chats" />}
              title={mode === "support" ? "Обращений пока нет" : "Чатов пока нет"}
              text={mode === "support" ? "Когда клиент или\u00a0специалист напишет в\u00a0поддержку, разговор появится здесь." : undefined}
            />
          ) : (
            entries.map((e) => {
              const isActive = selected === e.key || (e.key === AI_KEY && showAIIntro);
              return (
                <button
                  key={e.key}
                  type="button"
                  className={s.item}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => select(e.key)}
                >
                  <ConvAvatar who={e.who} size={46} />
                  <span className={s.itemBody}>
                    <span className={s.itemTop}>
                      <span className={s.itemName}>{e.name}</span>
                      {e.time && <span className={s.itemTime}>{when(e.time)}</span>}
                    </span>
                    <span className={s.itemBottom}>
                      <span className={s.itemPreview}>
                        {e.conv && e.conv.retention !== "forever" && <Timer size={12} className={s.itemTimer} aria-label="Исчезающие сообщения" />}
                        {e.preview || (e.conv ? "Нет сообщений" : "")}
                      </span>
                      {e.unread > 0 && <span className={s.unread}>{e.unread > 99 ? "99+" : e.unread}</span>}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
        <div className={s.privacy}>
          <Lock size={16} />
          <p>{PRIVACY[mode]}</p>
        </div>
      </aside>

      <div className={s.viewPane}>
        {showAIIntro ? (
          <AIIntro
            status={ai}
            onBack={() => select(null)}
            onConsent={async (st) => {
              setAi(st);
              await load();
              if (st.conversation_id) select(st.conversation_id);
            }}
          />
        ) : active ? (
          <ConversationView
            key={active.id}
            conv={active}
            onBack={() => select(null)}
            onChange={updateConv}
            ai={active.kind === "ai" ? ai : null}
            onAIStatus={(st) => {
              setAi(st);
              if (!st.consent) select(AI_KEY);
            }}
          />
        ) : selected && convs ? (
          <div className={s.placeholder}>
            {opening ? <Skeleton width={220} height={18} /> : (
              <EmptyState art={<EmptyArt scene="search" />}
                title="Чат не&nbsp;найден"
                text="Возможно, он&nbsp;был удалён или&nbsp;у&nbsp;вас нет к&nbsp;нему доступа."
                action={<Button variant="secondary" onClick={() => select(null)}>К&nbsp;списку чатов</Button>}
              />
            )}
          </div>
        ) : (
          <div className={s.placeholder}>
            <ChatBubbles className={art.placeholderArt} />
            <h2 className={s.placeholderTitle}>Спокойное место для&nbsp;разговора</h2>
            <p className={s.placeholderText}>Выберите чат слева. Вот что&nbsp;защищает вашу переписку:</p>
            <ul className={s.features}>
              <li>
                <Lock size={18} /> Сообщения и&nbsp;файлы хранятся на&nbsp;сервере в&nbsp;зашифрованном виде
              </li>
              <li>
                <PencilLine size={18} /> Любое своё сообщение можно изменить или&nbsp;удалить&nbsp;— у&nbsp;себя или&nbsp;у&nbsp;всех
              </li>
              <li>
                <Timer size={18} /> Исчезающие сообщения: новые исчезают сами через 1&nbsp;час или&nbsp;1&nbsp;день
              </li>
              <li>
                <Mic size={18} /> Голосовые можно записать с&nbsp;маской голоса&nbsp;— она применяется ещё на&nbsp;устройстве
              </li>
              <li>
                <EyeOff size={18} /> {mode === "support" ? "Сотрудники видят только обращения в\u00a0поддержку" : "Сотрудники платформы не\u00a0читают ваши чаты со\u00a0специалистами"}
              </li>
            </ul>
          </div>
        )}
      </div>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Новый чат" width={460}>
        {!contacts ? (
          <div style={{ display: "grid", gap: 10 }}>
            <Skeleton height={52} />
            <Skeleton height={52} />
          </div>
        ) : contacts.length === 0 ? (
          <div className={s.modalText}>
            {mode === "client" ? (
              <>
                <p>Написать специалисту можно после записи на&nbsp;созвон. Пока можно поговорить с&nbsp;Тишей или&nbsp;написать в&nbsp;поддержку.</p>
                <div className={s.modalActions}>
                  <SearchTrigger variant="primary">
                    Выбрать специалиста
                  </SearchTrigger>
                </div>
              </>
            ) : (
              <p>Когда клиент запишется к&nbsp;вам на&nbsp;созвон, здесь можно будет начать с&nbsp;ним чат.</p>
            )}
          </div>
        ) : (
          <div className={s.contacts}>
            {contacts.map((c) => (
              <button key={c.psychologist_id ?? c.client_alias} type="button" className={s.item} onClick={() => startWith(c)}>
                <ConvAvatar who={{ type: c.type, name: c.name, avatar_config: c.avatar_config }} size={42} />
                <span className={s.itemBody}>
                  <span className={s.itemName}>{c.name}</span>
                  <span className={s.itemPreview}>{c.type === "specialist" ? "Специалист" : "Клиент"}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
