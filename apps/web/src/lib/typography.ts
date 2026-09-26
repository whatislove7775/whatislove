/**
 * Russian typography: non-breaking spaces (U+00A0) so a line never ends with a short
 * preposition/conjunction/particle, numbers stay with their units, and a dash never starts a line.
 *
 *   typo("Помощь в любой момент — 3 400 ₽ за 50 мин")
 *   → "Помощь в любой момент — 3 400 ₽ за 50 мин"
 *
 * Idempotent (only ordinary spaces are touched), safe for Markdown (block markers are not words).
 * Plain TS without path aliases: scripts/typograph.mjs and the node:test suite import it directly.
 */

export const NBSP = " ";

/** Short words glued to the NEXT word (besides every 1–2-letter Cyrillic word). */
const LONG_SHORT = ["без", "для", "при", "про", "что", "как", "это", "или", "над", "под", "обо", "ото", "изо", "чем", "из-за", "из-под"];
/** Particles glued to the PREVIOUS word instead. */
const PARTICLES = ["ли", "ль", "же", "ж", "бы", "б"];

const L = "а-яёА-ЯЁ";
// A word starts after the text start, whitespace or opening punctuation.
const BEFORE = `(?<=^|[\\s(«„"'\\[\\/—–])`;

const SHORT_RE = new RegExp(
  `${BEFORE}(?!(?:${PARTICLES.join("|")})(?![${L}]))((?:${LONG_SHORT.join("|")})|[${L}]{1,2}) (?=[^\\s])`,
  "giu",
);
const PARTICLE_RE = new RegExp(`(?<=[${L}\\w]) (?=(?:${PARTICLES.join("|")})(?![${L}\\w-]))`, "giu");
/** "3 400" → thousands groups stay together. */
const THOUSANDS_RE = /(?<=\d) (?=\d{3}(?!\d))/g;
/** "50 мин", "3 400 ₽", "5 человек", "10 %" → a number keeps the word/unit after it. */
const NUM_UNIT_RE = new RegExp(`(?<=\\d) (?=[${L}a-zA-Z₽$€%°№])`, "gu");
/** "№ 5", "§ 2" → the sign keeps its number. */
const SIGN_NUM_RE = /(?<=[№§]) (?=\d)/g;
/** "слово — продолжение": the dash stays on the line of the previous word. */
const DASH_RE = /(?<=\S) (?=[—–](?:\s|$))/g;

export function typo(text: string): string;
export function typo(text: string | null | undefined): string | null | undefined;
export function typo(text: string | null | undefined): string | null | undefined {
  if (!text || text.indexOf(" ") === -1) return text;
  return text
    .replace(SHORT_RE, `$1${NBSP}`)
    .replace(PARTICLE_RE, NBSP)
    .replace(THOUSANDS_RE, NBSP)
    .replace(NUM_UNIT_RE, NBSP)
    .replace(SIGN_NUM_RE, NBSP)
    .replace(DASH_RE, NBSP);
}
