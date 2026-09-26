#!/usr/bin/env node
/**
 * Codemod: Russian typography for static UI strings (see src/lib/typography.ts).
 *
 *   node scripts/typograph.mjs [--check] <file-or-dir> [...]      (paths relative to apps/web)
 *
 * Touches only text a person reads:
 *   - JSX text  → NBSP written as `&nbsp;`
 *   - string / template literals with Cyrillic → NBSP written as ` `
 * Skips: imports/exports, object keys, comparisons/switch cases, `className`/`href`/`key`/… attributes,
 * `value`/`id`/`slug`-like properties (values the API or logic may compare), URLs, `data-*`,
 * and any file part inside comments. `--check` lists what would change and exits 1 if anything would.
 * Idempotent: existing NBSP/`&nbsp;`/` ` are understood.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { typo } from "../src/lib/typography.ts";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const NBSP = " ";
const SKIP_ATTRS = new Set([
  "className", "href", "src", "id", "key", "type", "name", "role", "rel", "target", "as", "variant", "size", "tone",
  "htmlFor", "method", "action", "autoComplete", "inputMode", "pattern", "lang", "dir", "style", "value", "defaultValue",
  "accept", "icon", "color", "sizes", "media", "charSet", "property", "content", "itemProp", "itemType",
]);
const SKIP_PROPS = new Set([
  "value", "id", "key", "slug", "topic", "kind", "code", "type", "href", "url", "path", "src", "className", "icon", "tone",
  "cover", "status", "role", "method", "name_en", "field", "param", "query", "q", "event", "tag", "tags",
]);
const SKIP_CALLS = new Set([
  "includes", "startsWith", "endsWith", "indexOf", "split", "replace", "replaceAll", "match", "test", "getItem", "setItem",
  "removeItem", "querySelector", "querySelectorAll", "get", "set", "has", "delete", "addEventListener", "fetch", "api",
  "RegExp", "require", "import", "matchMedia", "localeCompare",
]);

const CYR = /[а-яё]/i;

function literalSkip(node) {
  const p = node.parent;
  if (!p) return true;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true; // object key
  if (ts.isPropertyAssignment(p) && p.initializer === node) {
    const k = p.name && (p.name.text ?? p.name.escapedText);
    if (k && SKIP_PROPS.has(String(k))) return true;
  }
  if (ts.isElementAccessExpression(p)) return true;
  if (ts.isCaseClause(p) || ts.isLiteralTypeNode(p)) return true;
  if (ts.isBinaryExpression(p)) {
    const op = p.operatorToken.kind;
    if ([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken, ts.SyntaxKind.InKeyword].includes(op)) return true;
  }
  if (ts.isCallExpression(p) || ts.isNewExpression(p)) {
    const e = p.expression;
    const n = ts.isPropertyAccessExpression(e) ? e.name.text : ts.isIdentifier(e) ? e.text : "";
    if (SKIP_CALLS.has(n)) return true;
  }
  if (ts.isJsxAttribute(p)) {
    const n = p.name.getText();
    if (SKIP_ATTRS.has(n) || n.startsWith("data-")) return true;
  }
  if (ts.isJsxExpression(p) && p.parent && ts.isJsxAttribute(p.parent)) {
    const n = p.parent.name.getText();
    if (SKIP_ATTRS.has(n) || n.startsWith("data-")) return true;
  }
  return false;
}

/** Transform a literal's raw text (between quotes), keeping escapes. */
function fixRaw(raw, { jsxAttr = false, glueEnd = false } = {}) {
  if (!CYR.test(raw) || raw.indexOf(" ") === -1) return raw;
  if (/https?:\/\/|^[\w-]+(\s[\w-]+)*$/.test(raw)) return raw; // URLs / class-like lists
  // JSX attribute strings are not JS strings: no \u escapes there, but HTML entities work.
  const enc = jsxAttr ? "&nbsp;" : "\\u00a0";
  const decoded = jsxAttr ? raw.replace(/&nbsp;/g, NBSP) : raw.replace(/\\u00a0/gi, NBSP);
  // a template part followed by `${…}`: let a trailing «на » glue to the interpolated value
  const out = glueEnd ? typo(decoded + "X").slice(0, -1) : typo(decoded);
  if (out === decoded) return raw;
  return out.replaceAll(NBSP, enc);
}

/**
 * JSX text: whitespace runs with a newline collapse to one space when rendered. typo() is
 * length-preserving (space → NBSP), so run it on a copy where each such run is a single space,
 * then write `&nbsp;` (joining the lines) only where it put an NBSP, and keep the other runs.
 */
function fixJsxText(raw) {
  if (!CYR.test(raw)) return raw;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(raw);
  const [, lead, body, trail] = m;
  const pieces = body.split(/(&nbsp;|[ \t]*\n\s*)/);
  // flat: text where every separator is one char; seps remember what each separator was
  let flat = "";
  const seps = [];
  for (let i = 0; i < pieces.length; i++) {
    if (i % 2 === 0) flat += pieces[i];
    else {
      seps.push({ at: flat.length, raw: pieces[i] });
      flat += pieces[i] === "&nbsp;" ? NBSP : " ";
    }
  }
  const fixed = typo(flat);
  if (fixed === flat) return raw;
  let out = "";
  let pos = 0;
  for (const s of seps) {
    out += fixed.slice(pos, s.at).replaceAll(NBSP, "&nbsp;");
    out += fixed[s.at] === NBSP ? "&nbsp;" : s.raw;
    pos = s.at + 1;
  }
  out += fixed.slice(pos).replaceAll(NBSP, "&nbsp;");
  return lead + out + trail;
}

function transform(file) {
  const src = fs.readFileSync(file, "utf8");
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  const edits = [];
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const raw = src.slice(node.pos, node.end);
      const fixed = fixJsxText(raw);
      if (fixed !== raw) edits.push([node.pos, node.end, fixed]);
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      if (!literalSkip(node)) {
        const start = node.getStart(sf);
        const raw = src.slice(start + 1, node.end - 1);
        const fixed = fixRaw(raw, { jsxAttr: ts.isJsxAttribute(node.parent) });
        if (fixed !== raw) edits.push([start + 1, node.end - 1, fixed]);
      }
    } else if (ts.isTemplateExpression(node)) {
      if (!literalSkip(node)) {
        const parts = [node.head, ...node.templateSpans.map((sp) => sp.literal)];
        for (const part of parts) {
          const start = part.getStart(sf);
          // head: `…${   middle: }…${   tail: }…`
          const open = 1;
          const close = ts.isTemplateTail(part) ? 1 : 2;
          const raw = src.slice(start + open, part.end - close);
          const fixed = fixRaw(raw, { glueEnd: !ts.isTemplateTail(part) });
          if (fixed !== raw) edits.push([start + open, part.end - close, fixed]);
        }
      }
      node.templateSpans.forEach((sp) => visit(sp.expression));
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length) return null;
  let out = src;
  for (const [a, b, text] of edits.sort((x, y) => y[0] - x[0])) out = out.slice(0, a) + text + out.slice(b);
  return { out, count: edits.length };
}

function* walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const f of fs.readdirSync(p)) {
      if (f === "node_modules" || f.startsWith(".")) continue;
      yield* walk(path.join(p, f));
    }
  } else if (/\.(tsx?|mts)$/.test(p) && !/\.d\.ts$|\.test\./.test(p) && !p.endsWith("typography.ts")) {
    yield p;
  }
}

const args = process.argv.slice(2);
const check = args.includes("--check");
const targets = args.filter((a) => !a.startsWith("--"));
if (!targets.length) {
  console.error("usage: node scripts/typograph.mjs [--check] <file-or-dir> [...]");
  process.exit(2);
}
let changed = 0;
for (const t of targets) {
  for (const file of walk(t)) {
    const r = transform(file);
    if (!r) continue;
    changed++;
    console.log(`${check ? "would fix" : "fixed"} ${r.count}\t${file}`);
    if (!check) fs.writeFileSync(file, r.out);
  }
}
console.log(`${changed} file(s) ${check ? "need fixes" : "updated"}`);
if (check && changed) process.exit(1);
