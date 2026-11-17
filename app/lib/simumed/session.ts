import type { Directives } from "./types";

/** Symbolic scene identifiers. Display labels live in the i18n dictionary
 *  (`scene.*`) so scene comparison stays stable across locale switches. */
export const SCENES = {
  admit: "admit",
  history: "history",
  investigation: "investigation",
  results: "results",
  decision: "decision",
  review: "review",
  score: "score",
  end: "end",
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];

export interface SessionState {
  o2Started: boolean;
  labsRequested: boolean;
  ecgDone: boolean;
  cxrDone: boolean;
  labsDelivered: boolean;
  dxOrdered: boolean;
  escalated: boolean;
  icuOrdered: boolean;
}

export function initialSessionState(): SessionState {
  return {
    o2Started: false,
    labsRequested: false,
    ecgDone: false,
    cxrDone: false,
    labsDelivered: false,
    dxOrdered: false,
    escalated: false,
    icuOrdered: false,
  };
}

/** Phase derived from state. `turnCount` = student turns so far; the
 *  interview shows as the focused-history phase from the first question,
 *  even before any order is placed. */
export function computeScene(state: SessionState, turnCount = 0): SceneKey {
  if (state.icuOrdered) return SCENES.review;
  if (state.escalated || state.dxOrdered) return SCENES.decision;
  if (state.labsDelivered) return SCENES.results;
  if (state.ecgDone || state.cxrDone || state.labsRequested)
    return SCENES.investigation;
  if (state.o2Started || turnCount >= 1) return SCENES.history;
  return SCENES.admit;
}

/** Update session state from LLM-declared directives. */
export function advance(
  state: SessionState,
  directives: Directives,
  factsCovered?: string[],
): SessionState {
  return {
    o2Started: state.o2Started || !!directives.oxygen_started,
    labsRequested: state.labsRequested || !!directives.labs_requested,
    ecgDone: state.ecgDone || !!directives.ecg_done,
    cxrDone: state.cxrDone || !!directives.cxr_done,
    labsDelivered: state.labsDelivered || !!factsCovered?.includes("labs-panel"),
    dxOrdered: state.dxOrdered || !!directives.dx_ordered,
    escalated: state.escalated || !!directives.dx_ordered,
    icuOrdered: state.icuOrdered || !!directives.icu_ordered,
  };
}

/** Student turns elapsed since treatment was ordered. `escalatedAt` is the
 *  student-turn count at which escalation happened (null = never). Used to
 *  time the resident's ICU-nudge interjection. */
export function turnsSinceEscalation(
  escalatedAt: number | null,
  currentTurn: number,
): number {
  if (escalatedAt === null) return 0;
  return Math.max(0, currentTurn - escalatedAt);
}

/** Union of previously elicited facts with the ones covered this turn.
 *  "labs-panel" is a synthetic trigger (it unlocks the labs card), not
 *  patient speech, so it never enters the documented history. */
export function mergeCoveredIds(
  prev: string[],
  newlyCovered?: string[],
): string[] {
  const out = new Set(prev);
  for (const id of newlyCovered ?? []) {
    if (id !== "labs-panel") out.add(id);
  }
  return [...out];
}
