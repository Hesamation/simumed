import { test } from "node:test";
import assert from "node:assert/strict";
import { caseFor } from "../lib/simumed/case-data";

test("case bundles: fact IDs match 1:1 across locales", () => {
  const fa = caseFor("fa");
  const en = caseFor("en");
  const faIds = fa.facts.map((f) => f.id).sort();
  const enIds = en.facts.map((f) => f.id).sort();
  assert.deepEqual(enIds.filter((id) => !faIds.includes(id)), []);
  assert.deepEqual(faIds.filter((id) => !enIds.includes(id)), []);
  assert.equal(faIds.length, enIds.length);
  assert.ok(faIds.length >= 40, "the teaching case keeps its full fact set");
});

test("case bundles: structural parity for labs, exam, media, roles", () => {
  const fa = caseFor("fa");
  const en = caseFor("en");
  assert.equal(fa.labs.length, en.labs.length);
  assert.equal(fa.abg.length, en.abg.length);
  assert.deepEqual(
    fa.labs.map((l) => l.label),
    en.labs.map((l) => l.label),
  );
  assert.deepEqual(
    fa.labs.map((l) => l.abnormal ?? false),
    en.labs.map((l) => l.abnormal ?? false),
  );
  assert.deepEqual(
    fa.examFindings.map((e) => e.id),
    en.examFindings.map((e) => e.id),
  );
  assert.deepEqual(
    fa.media.map((m) => m.id),
    en.media.map((m) => m.id),
  );
  assert.deepEqual(
    fa.roles.map((r) => r.role),
    en.roles.map((r) => r.role),
  );
});

test("case bundles: shared numeric vitals", () => {
  const fa = caseFor("fa");
  const en = caseFor("en");
  assert.deepEqual(fa.vitals, en.vitals);
  assert.equal(fa.vitals.spo2, 86);
  assert.equal(fa.vitals.rr, 32);
});

test("en case: labs use Latin digit strings, fa uses Persian digit strings", () => {
  const fa = caseFor("fa");
  const en = caseFor("en");
  assert.equal(en.labs[0].value, "17,800");
  assert.match(fa.labs[0].value, /[۰-۹]/);
  assert.doesNotMatch(en.labs[0].value, /[۰-۹]/);
  assert.doesNotMatch(fa.labs[0].value, /[0-9]/);
});

test("en patient speech is first-person English, not translationese markers", () => {
  const en = caseFor("en");
  for (const f of en.facts) {
    assert.doesNotMatch(f.answer, /^\(/, "no stage-direction parentheses");
  }
  assert.match(
    en.facts.find((f) => f.id === "chief-dyspnea")!.answer,
    /can't breathe|cannot breathe/,
  );
});
