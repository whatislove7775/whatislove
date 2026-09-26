/**
 * Specialist search (command palette + /app/specialists).
 * Backend: GET /psychologists/search/, GET /psychologists/ (same filters), GET /psychologists/popular-requests/.
 * Search queries are never stored on the server.
 */
import { api } from "./client";
import type { PsychologistPublic } from "./types";

export type WhenFilter = "today" | "3days" | "evening" | "weekend";
export type TimeOfDay = "morning" | "day" | "evening";
export type GenderFilter = "female" | "male";
export type SortOrder = "relevance" | "soon" | "price" | "rating" | "experience";

export interface SpecialistQuery {
  q?: string;
  /** requests / topics — any of them */
  topics?: string[];
  /** approaches — any of them */
  approaches?: string[];
  min_rate?: number;
  max_rate?: number;
  /** quick presets: today / next 3 days / weekend (legacy: evening) */
  when?: WhenFilter;
  /** weekdays, 0 = Monday */
  days?: number[];
  times?: TimeOfDay[];
  /** YYYY-MM-DD, inclusive, in the viewer's time zone */
  date_from?: string;
  date_to?: string;
  duration?: number;
  min_experience?: number;
  gender?: GenderFilter;
  language?: string;
  /** only specialists who offer «Знакомство, 15 минут» */
  intro?: boolean;
  sort?: SortOrder;
}

export interface SearchResult {
  count: number;
  results: (PsychologistPublic & { gender?: "" | GenderFilter })[];
}

export interface Facet {
  label: string;
  count: number;
}

export interface SearchFacets {
  popular: Facet[];
  topics: Facet[];
  approaches: { value: string; label: string; count: number }[];
  languages: Facet[];
  durations: number[];
  genders: { value: GenderFilter; count: number }[];
  price: { min: number; max: number };
  when: { value: WhenFilter; label: string }[];
  times?: { value: TimeOfDay; label: string; from: number; to: number }[];
  /** how many specialists offer a 15-minute intro call */
  intro?: number;
}

const clientTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};

function toParams(q: SpecialistQuery): Record<string, string | number | undefined> {
  return {
    q: q.q?.trim() || undefined,
    topics: q.topics?.length ? q.topics.join(",") : undefined,
    approach: q.approaches?.length ? q.approaches.join(",") : undefined,
    min_rate: q.min_rate,
    max_rate: q.max_rate,
    when: q.when,
    days: q.days?.length ? q.days.join(",") : undefined,
    times: q.times?.length ? q.times.join(",") : undefined,
    date_from: q.date_from,
    date_to: q.date_to,
    duration: q.duration,
    min_experience: q.min_experience,
    gender: q.gender,
    language: q.language,
    intro: q.intro ? 1 : undefined,
    sort: q.sort && q.sort !== "relevance" ? q.sort : undefined,
    tz: hasTime(q) ? clientTz() : undefined,
  };
}

/** Any time-of-slot filter set (the server then needs the viewer's time zone). */
export function hasTime(q: SpecialistQuery): boolean {
  return !!(q.when || q.days?.length || q.times?.length || q.date_from || q.date_to);
}

export const searchApi = {
  search: (q: SpecialistQuery, limit = 6, signal?: AbortSignal) =>
    api<SearchResult>("/psychologists/search/", { query: { ...toParams(q), limit }, signal, auth: false }),
  list: (q: SpecialistQuery, signal?: AbortSignal) =>
    api<PsychologistPublic[]>("/psychologists/", { query: toParams(q), signal, auth: false }),
  facets: () => api<SearchFacets>("/psychologists/popular-requests/", { auth: false }),
};

// ── URL <-> filters (the «Показать всех» link and /app/specialists) ────────────

const WHEN_VALUES: WhenFilter[] = ["today", "3days", "evening", "weekend"];
const SORT_VALUES: SortOrder[] = ["relevance", "soon", "price", "rating", "experience"];
const TIME_VALUES: TimeOfDay[] = ["morning", "day", "evening"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function queryToSearchParams(q: SpecialistQuery): URLSearchParams {
  const p = new URLSearchParams();
  if (q.q?.trim()) p.set("q", q.q.trim());
  q.topics?.forEach((t) => p.append("topic", t));
  q.approaches?.forEach((a) => p.append("approach", a));
  if (q.min_rate) p.set("min_rate", String(q.min_rate));
  if (q.max_rate) p.set("max_rate", String(q.max_rate));
  if (q.when) p.set("when", q.when);
  if (q.days?.length) p.set("days", q.days.join(","));
  if (q.times?.length) p.set("times", q.times.join(","));
  if (q.date_from) p.set("date_from", q.date_from);
  if (q.date_to) p.set("date_to", q.date_to);
  if (q.duration) p.set("duration", String(q.duration));
  if (q.min_experience) p.set("min_experience", String(q.min_experience));
  if (q.gender) p.set("gender", q.gender);
  if (q.language) p.set("language", q.language);
  if (q.intro) p.set("intro", "1");
  if (q.sort && q.sort !== "relevance") p.set("sort", q.sort);
  return p;
}

export function searchParamsToQuery(p: URLSearchParams | null | undefined): SpecialistQuery {
  if (!p) return {};
  const num = (k: string) => {
    const v = Number(p.get(k));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  const when = p.get("when") as WhenFilter | null;
  const gender = p.get("gender");
  const sort = p.get("sort") as SortOrder | null;
  const topics = [...p.getAll("topic"), ...(p.get("topics")?.split(",") ?? [])].map((t) => t.trim()).filter(Boolean);
  const approaches = p.getAll("approach").flatMap((a) => a.split(",")).map((a) => a.trim()).filter(Boolean);
  const days = Array.from(
    new Set((p.get("days") ?? "").split(",").map((x) => x.trim()).filter((x) => /^[0-6]$/.test(x)).map(Number)),
  );
  const times = (p.get("times") ?? "").split(",").filter((t): t is TimeOfDay => TIME_VALUES.includes(t as TimeOfDay));
  const date = (k: string) => {
    const v = p.get(k);
    return v && ISO_DATE.test(v) ? v : undefined;
  };
  return {
    q: p.get("q") ?? undefined,
    topics: topics.length ? Array.from(new Set(topics)) : undefined,
    approaches: approaches.length ? Array.from(new Set(approaches)) : undefined,
    min_rate: num("min_rate"),
    max_rate: num("max_rate"),
    when: when && WHEN_VALUES.includes(when) ? when : undefined,
    days: days.length ? days.sort((a, b) => a - b) : undefined,
    times: times.length ? Array.from(new Set(times)) : undefined,
    date_from: date("date_from"),
    date_to: date("date_to"),
    duration: num("duration"),
    min_experience: num("min_experience"),
    gender: gender === "female" || gender === "male" ? gender : undefined,
    language: p.get("language") || undefined,
    intro: p.get("intro") === "1" || undefined,
    sort: sort && SORT_VALUES.includes(sort) ? sort : undefined,
  };
}

/** Number of active filters (not counting the text). */
export function activeFilters(q: SpecialistQuery): number {
  return (
    (q.topics?.length ?? 0) +
    (q.approaches?.length ?? 0) +
    [q.min_rate || q.max_rate, hasTime(q), q.duration, q.min_experience, q.gender, q.language, q.intro].filter(Boolean).length
  );
}
