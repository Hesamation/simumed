import { test } from "node:test";
import assert from "node:assert/strict";
import { introPrompt, parseLLMOutput, systemPrompt } from "../lib/simumed/llm-contract";

test("parseLLMOutput: accepts a valid nurse reply with hint and directives", () => {
  const raw = JSON.stringify({
    role: "nurse",
    kind: "reply",
    text: "Right away, Doctor.",
    hint: "Start with oxygen.",
    directives: { oxygen_started: true },
  });
  const out = parseLLMOutput(raw);
  assert.ok(out);
  assert.equal(out.role, "nurse");
  assert.equal(out.kind, "reply");
  assert.equal(out.text, "Right away, Doctor.");
  assert.equal(out.hint, "Start with oxygen.");
  assert.deepEqual(out.directives, { oxygen_started: true });
});

test("parseLLMOutput: extracts JSON embedded in chatter", () => {
  const raw = `Sure! Here is the reply:\n{"role":"patient","text":"I can't catch my breath","directives":{}}\nDone.`;
  const out = parseLLMOutput(raw);
  assert.ok(out);
  assert.equal(out.role, "patient");
  assert.equal(out.text, "I can't catch my breath");
});

test("parseLLMOutput: kind defaults to reply unless interjection", () => {
  const out = parseLLMOutput('{"role":"resident","text":"x","kind":"interjection","directives":{}}');
  assert.equal(out?.kind, "interjection");
  const out2 = parseLLMOutput('{"role":"resident","text":"x","kind":"nonsense","directives":{}}');
  assert.equal(out2?.kind, "reply");
});

test("parseLLMOutput: rejects invalid roles", () => {
  assert.equal(parseLLMOutput('{"role":"student","text":"x","directives":{}}'), null);
  assert.equal(parseLLMOutput('{"role":"system","text":"x","directives":{}}'), null);
});

test("parseLLMOutput: rejects empty or missing text", () => {
  assert.equal(parseLLMOutput('{"role":"patient","text":"   ","directives":{}}'), null);
  assert.equal(parseLLMOutput('{"role":"patient","directives":{}}'), null);
});

test("parseLLMOutput: rejects non-JSON and fragments", () => {
  assert.equal(parseLLMOutput("hello world"), null);
  assert.equal(parseLLMOutput("{"), null);
  assert.equal(parseLLMOutput(""), null);
  assert.equal(parseLLMOutput('{"text": truncated'), null);
});

test("parseLLMOutput: hint trimmed, blank hint becomes null", () => {
  assert.equal(parseLLMOutput('{"role":"patient","text":"x","hint":"  ","directives":{}}')?.hint, null);
  assert.equal(parseLLMOutput('{"role":"patient","text":"x","hint":" ok ","directives":{}}')?.hint, "ok");
});

test("systemPrompt: en locale speaks English about the English case", () => {
  const p = systemPrompt([], [], 1, false, false, 0, "en");
  assert.match(p, /Mr\. Alireza Ahmadi/);
  assert.match(p, /retired retired construction welder|retired construction welder/);
  assert.match(p, /I'm sixty-eight/);
  assert.match(p, /Conversational|conversational/);
  assert.ok(
    !p.includes("آقای علیرضا احمدی"),
    "en prompt must not leak the fa patient name",
  );
});

test("systemPrompt: fa locale preserves the original Persian persona verbatim", () => {
  const p = systemPrompt([], [], 1, false, false, 0, "fa");
  assert.match(p, /آقای علیرضا احمدی/);
  assert.match(p, /Conversational Tehrani register/);
  assert.match(p, /شصت و هشت سالمه/);
});

test("systemPrompt: oxygen-neglect interjection is locale-specific", () => {
  const en = systemPrompt([], [], 3, false, true, 0, "en");
  assert.match(en, /OXYGEN NEGLECT/);
  assert.match(en, /SpO₂ is eighty-six percent/);
  const fa = systemPrompt([], [], 3, false, true, 0, "fa");
  assert.match(fa, /اول اکسیژن، بعد شرح‌حال/);
});

test("systemPrompt: ICU-neglect interjection appears only after 2 turns", () => {
  const early = systemPrompt([], [], 3, true, true, 1, "en");
  assert.equal(early.includes("ICU NEGLECT"), false);
  const late = systemPrompt([], [], 3, true, true, 2, "en");
  assert.match(late, /ICU NEGLECT/);
});

test("introPrompt: both locales carry the nurse handover contract", () => {
  const fa = introPrompt("fa");
  assert.match(fa, /آقای علیرضا احمدی/);
  assert.match(fa, /NEVER speak in the first person as the patient/);
  const en = introPrompt("en");
  assert.match(en, /Mr\. Alireza Ahmadi/);
  assert.match(en, /NEVER speak in the first person as the patient/);
  assert.match(en, /SpO₂ 86% without oxygen/);
});
