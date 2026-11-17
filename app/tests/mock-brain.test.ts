import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bestFactId,
  mockDecide,
  mockIntro,
  mockReview,
} from "../lib/simumed/mock-brain";
import { initialSessionState, type SessionState } from "../lib/simumed/session";
import type { Locale } from "../lib/i18n/config";

function state(partial: Partial<SessionState>): SessionState {
  return { ...initialSessionState(), ...partial };
}

test("mockDecide: order keywords map to exactly one directive (en + fa)", () => {
  const cases: [string, Locale, string][] = [
    ["give oxygen 15L", "en", "oxygen_started"],
    ["اکسیژن بده", "fa", "oxygen_started"],
    ["ECG please", "en", "ecg_done"],
    ["نوار قلب بگیر", "fa", "ecg_done"],
    ["chest x-ray now", "en", "cxr_done"],
    ["گرافی قفسه سینه", "fa", "cxr_done"],
    ["order labs and blood gas", "en", "labs_requested"],
    ["آزمایش خون درخواست می‌کنم", "fa", "labs_requested"],
    ["start antibiotics and admit", "en", "dx_ordered"],
    ["آنتی‌بیوتیک شروع کن و بستری", "fa", "dx_ordered"],
    ["prepare ICU transfer", "en", "icu_ordered"],
    ["آماده‌باش ICU", "fa", "icu_ordered"],
  ];
  for (const [input, locale, key] of cases) {
    const out = mockDecide(input, locale);
    assert.equal(
      Object.keys(out.directives).filter(
        (k) => out.directives[k as keyof typeof out.directives] === true,
      ).length,
      1,
      `"${input}" must set exactly one directive`,
    );
    assert.equal(out.role, "nurse");
    assert.equal(out.directives[key as keyof typeof out.directives], true, `"${input}" must set ${key}`);
  }
});

test("mockDecide: a lab order never sets dx_ordered", () => {
  const out = mockDecide("order labs please", "en");
  assert.equal(out.directives.labs_requested, true);
  assert.equal(out.directives.dx_ordered, undefined);
});

test("mockDecide: history questions answer from PATIENT KNOWLEDGE", () => {
  const out = mockDecide("How long have you been smoking?", "en");
  assert.equal(out.role, "patient");
  assert.match(out.text, /pack a day|fifty years/);
  assert.ok(out.directives.facts_covered?.length);
});

test("mockDecide: history questions never fire directives", () => {
  for (const q of [
    "Do you have fevers at night?",
    "Any chest pain?",
    "What about your medications?",
    "تب داری؟ شب‌ها عرق می‌کنی؟",
    "سیگار می‌کشی؟",
  ]) {
    const out = mockDecide(q, /[؟?]\s*$|سیگار/.test(q) && /[\u0600-\u06FF]/.test(q) ? "fa" : "en");
    assert.deepEqual(
      Object.keys(out.directives).filter(
        (k) => out.directives[k as keyof typeof out.directives] === true,
      ),
      [],
      `"${q}" must not set a directive`,
    );
  }
});

test("mockDecide: unmatched questions get the dodge, no directives", () => {
  const out = mockDecide("Do you like pineapple pizza?", "en");
  assert.equal(out.role, "patient");
  assert.deepEqual(out.directives, {});
  assert.match(out.text, /hasn't told me/);
});

test("bestFactId: requires real overlap", () => {
  assert.equal(bestFactId("asdf qwerty", "en"), null);
  assert.ok(bestFactId("smoking fifty years pack", "en"));
});

test("mockIntro: locale-appropriate handover mentioning the key vitals", () => {
  const en = mockIntro("en");
  assert.match(en, /sixty-eight/);
  assert.match(en, /eighty-six percent/);
  const fa = mockIntro("fa");
  assert.match(fa, /۶۸/);
  assert.match(fa, /اکسیژن/);
});

test("mockReview: hypoxaemic patient without oxygen is a critical error", () => {
  const r = mockReview(["age-sex-job"], state({ dxOrdered: true }), "en");
  assert.equal(r.criticalErrors, 1);
  const r2 = mockReview(["age-sex-job"], state({ o2Started: true, dxOrdered: true, icuOrdered: true }), "en");
  assert.equal(r2.criticalErrors, 0);
  assert.equal(r2.majorErrors, 0);
  assert.ok(r2.score > r.score);
});

test("mockReview: scores are clamped 0-100 and domains are five", () => {
  const r = mockReview([], initialSessionState(), "fa");
  for (const d of r.domains) {
    assert.ok(d.value >= 0 && d.value <= 100);
  }
  assert.equal(r.domains.length, 5);
  assert.ok(r.score >= 0 && r.score <= 100);
  assert.match(r.feedback, /دکتر/);
});
