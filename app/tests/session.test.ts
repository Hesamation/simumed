import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SCENES,
  advance,
  computeScene,
  initialSessionState,
  mergeCoveredIds,
  turnsSinceEscalation,
  type SessionState,
} from "../lib/simumed/session";

function state(partial: Partial<SessionState>): SessionState {
  return { ...initialSessionState(), ...partial };
}

test("computeScene: fresh session is admit", () => {
  assert.equal(computeScene(initialSessionState(), 0), SCENES.admit);
});

test("computeScene: first student turn or oxygen moves to history", () => {
  assert.equal(computeScene(initialSessionState(), 1), SCENES.history);
  assert.equal(
    computeScene(state({ o2Started: true }), 0),
    SCENES.history,
  );
});

test("computeScene: any investigation order moves to investigation", () => {
  for (const s of [
    state({ labsRequested: true }),
    state({ ecgDone: true }),
    state({ cxrDone: true }),
  ]) {
    assert.equal(computeScene(s, 0), SCENES.investigation);
  }
});

test("computeScene: labs delivered moves to results", () => {
  assert.equal(
    computeScene(state({ labsDelivered: true, labsRequested: true }), 0),
    SCENES.results,
  );
});

test("computeScene: treatment order escalates to decision, ICU to review", () => {
  assert.equal(computeScene(state({ dxOrdered: true }), 0), SCENES.decision);
  assert.equal(computeScene(state({ icuOrdered: true }), 0), SCENES.review);
});

test("computeScene: ICU review outranks everything", () => {
  assert.equal(
    computeScene(
      state({ icuOrdered: true, dxOrdered: true, labsDelivered: true }),
      5,
    ),
    SCENES.review,
  );
});

test("advance: directives latch on and never reset", () => {
  const s0 = initialSessionState();
  const s1 = advance(s0, { oxygen_started: true, labs_requested: true });
  assert.equal(s1.o2Started, true);
  assert.equal(s1.labsRequested, true);
  const s2 = advance(s1, {});
  assert.equal(s2.o2Started, true, "oxygen must persist across turns");
  assert.equal(s2.labsRequested, true);
});

test("advance: dx_ordered implies escalated", () => {
  const s = advance(initialSessionState(), { dx_ordered: true });
  assert.equal(s.dxOrdered, true);
  assert.equal(s.escalated, true);
});

test("advance: facts_covered with labs-panel unlocks labs delivery", () => {
  const s = advance(initialSessionState(), {}, ["labs-panel"]);
  assert.equal(s.labsDelivered, true);
  const s2 = advance(initialSessionState(), {}, ["age-sex-job"]);
  assert.equal(s2.labsDelivered, false);
});

test("turnsSinceEscalation: 0 before escalation, grows after, never negative", () => {
  assert.equal(turnsSinceEscalation(null, 5), 0);
  assert.equal(turnsSinceEscalation(6, 6), 0);
  assert.equal(turnsSinceEscalation(6, 8), 2);
  assert.equal(turnsSinceEscalation(6, 4), 0, "clock skew must not go negative");
});

test("mergeCoveredIds: accumulates, dedupes, and excludes the synthetic labs-panel id", () => {
  assert.deepEqual(mergeCoveredIds([], ["age-sex-job", "age-sex-job", "cough"]), [
    "age-sex-job",
    "cough",
  ]);
  assert.deepEqual(mergeCoveredIds(["cough"], ["labs-panel"]), ["cough"]);
  assert.deepEqual(mergeCoveredIds(["cough"], undefined), ["cough"]);
});

test("SCENES values are stable symbolic keys (locale-independent)", () => {
  for (const v of Object.values(SCENES)) {
    assert.match(v, /^[a-z]+$/, "scene keys must be bare ASCII identifiers");
  }
});
