// Run: node --test src/lib/typography.test.mjs   (Node ≥ 22 strips the TS types on import)
import { test } from "node:test";
import assert from "node:assert/strict";
import { NBSP, typo } from "./typography.ts";

const n = (s) => s.replaceAll("~", NBSP); // "~" in expectations = NBSP

test("glues short prepositions, conjunctions and particles to the next word", () => {
  assert.equal(typo("Помощь в любой момент"), n("Помощь в~любой момент"));
  assert.equal(typo("и в доме, и на работе"), n("и~в~доме, и~на~работе"));
  assert.equal(typo("Это не про вас"), n("Это~не~про~вас"));
  assert.equal(typo("Без почты и телефона"), n("Без~почты и~телефона"));
  assert.equal(typo("Помощь для тех, кто устал"), n("Помощь для~тех, кто устал"));
  assert.equal(typo("из-за погоды"), n("из-за~погоды"));
});

test("particles stick to the previous word", () => {
  assert.equal(typo("у меня так же"), n("у~меня так~же"));
  assert.equal(typo("Было бы легче"), n("Было~бы легче"));
  assert.equal(typo("Знаете ли вы"), n("Знаете~ли вы"));
});

test("numbers keep their units and thousands", () => {
  assert.equal(typo("от 3 400 ₽"), n("от~3~400~₽"));
  assert.equal(typo("созвон 50 мин"), n("созвон 50~мин"));
  assert.equal(typo("Группы на 5–8 человек"), n("Группы на~5–8~человек"));
  assert.equal(typo("№ 12"), n("№~12"));
  assert.equal(typo("скидка 10 %"), n("скидка 10~%"));
});

test("a dash never starts a line", () => {
  assert.equal(typo("Анонимность — это продукт"), n("Анонимность~— это~продукт"));
  assert.equal(typo("Сотрудник — аккаунт"), n("Сотрудник~— аккаунт"));
});

test("is idempotent and leaves other text alone", () => {
  const once = typo("Сотрудник получает код и общается с психологом — без почты, 3 400 ₽ за 50 мин.");
  assert.equal(typo(once), once);
  assert.equal(typo("Hello world"), "Hello world");
  assert.equal(typo("кто-то сказал"), "кто-то сказал");
  assert.equal(typo(""), "");
  assert.equal(typo(null), null);
  assert.equal(typo(undefined), undefined);
});

test("Markdown structure survives", () => {
  const md = "## В начале\n\n- и дальше\n1. на месте\n\n[в тексте](https://aprosop.ru/a b)";
  const out = typo(md);
  assert.equal(out, n("## В~начале\n\n- и~дальше\n1. на~месте\n\n[в~тексте](https://aprosop.ru/a b)"));
});
