import {
  type LLMOutput,
  introPrompt,
  parseLLMOutput,
  systemPrompt,
  type HistoryTurn,
} from "@/lib/simumed/llm-contract";
import { pickLocale } from "@/lib/i18n/config";
import { dictFor } from "@/lib/i18n/dict";
import { complete, llmConfig } from "@/lib/simumed/llm";
import { mockDecide, mockEnabled, mockIntro } from "@/lib/simumed/mock-brain";
import { caseFor } from "@/lib/simumed/case-data";
import {
  SCENES,
  advance,
  mergeCoveredIds,
  computeScene,
  initialSessionState,
  type SessionState,
} from "@/lib/simumed/session";

export const dynamic = "force-dynamic";

interface DecideBody {
  input?: unknown;
  history?: unknown;
  coveredIds?: unknown;
  state?: unknown;
  turnCount?: unknown;
  o2Started?: unknown;
  escalated?: unknown;
  turnsSinceEscalation?: unknown;
  locale?: unknown;
  /** When true, generate the nurse's opening handover instead of a reply. */
  intro?: unknown;
}

interface TurnMsg {
  role: "nurse" | "patient" | "resident" | "system" | "student";
  text: string;
  kind?: string;
  factId?: string | null;
  scene?: string;
  card?: string;
  hero?: string;
}

function isState(s: unknown): s is SessionState {
  if (!s || typeof s !== "object" || Array.isArray(s)) return false;
  const o = s as Record<string, unknown>;
  return (
    typeof o.o2Started === "boolean" &&
    typeof o.dxOrdered === "boolean" &&
    typeof o.icuOrdered === "boolean"
  );
}

function dodge(state: SessionState, turnCount: number, locale: "en" | "fa", coveredIds: string[] = []): Response {
  const t = dictFor(locale);
  return Response.json({
    turn: [
      {
        role: "patient",
        text: t.s.dodge,
        kind: "refusal",
        scene: computeScene(state, turnCount + 1),
      },
    ],
    state,
    coveredIds,
    hint: null,
  });
}

export async function GET() {
  const cfg = llmConfig();
  const mock = mockEnabled();
  return Response.json({
    enabled: cfg !== null || mock,
    model: cfg?.model ?? (mock ? "mock" : null),
  });
}

export async function POST(request: Request) {
  const cfg = llmConfig();

  let body: DecideBody = {};
  try {
    body = (await request.json()) as DecideBody;
  } catch {
    body = {};
  }

  // The client's active session locale is authoritative; fall back to the
  // locale cookie, then the default.
  const locale = pickLocale(body.locale, request.headers.get("cookie"));
  const t = dictFor(locale);
  const c = caseFor(locale);

  const state: SessionState = isState(body.state)
    ? { ...initialSessionState(), ...(body.state as SessionState) }
    : initialSessionState();
  const turnCount = typeof body.turnCount === "number" ? body.turnCount : 0;
  const coveredIds = Array.isArray(body.coveredIds)
    ? body.coveredIds.filter((id): id is string => typeof id === "string")
    : [];

  // Deterministic demo brain (SIMUMED_MOCK_LLM=1): answers from the canonical
  // case knowledge, no provider credentials involved.
  if (!cfg && mockEnabled()) {
    if (body.intro === true) {
      return Response.json({
        turn: [
          {
            role: "nurse",
            text: mockIntro(locale),
            kind: "ack",
            scene: SCENES.admit,
          },
        ],
        state,
        hint: locale === "fa"
          ? "با علائم حیاتی شروع کن؛ این اشباع پایین است."
          : "Start from the vitals — that saturation is low.",
      });
    }
    const input = typeof body.input === "string" ? body.input.trim() : "";
    if (!input || input.length > 1000) {
      return Response.json({ error: "invalid input" }, { status: 400 });
    }
    return buildResponse(mockDecide(input, locale), state, turnCount, locale, coveredIds);
  }

  if (!cfg) {
    return Response.json({ error: "LLM not configured" }, { status: 503 });
  }

  const input = typeof body.input === "string" ? body.input.trim() : "";
  const history: HistoryTurn[] = Array.isArray(body.history)
    ? (body.history as { role?: unknown; text?: unknown }[])
        .filter(
          (t) =>
            t &&
            typeof t.role === "string" &&
            typeof t.text === "string",
        )
        .slice(-6)
        .map((t) => ({
          role: t.role as HistoryTurn["role"],
          text: (t.text as string).slice(0, 200),
        }))
    : [];
  const o2Started = typeof body.o2Started === "boolean" ? body.o2Started : state.o2Started;
  const escalated = typeof body.escalated === "boolean" ? body.escalated : state.escalated;
  const turnsSinceEscalation = typeof body.turnsSinceEscalation === "number" ? body.turnsSinceEscalation : 0;

  // Opening handover: nurse presents the patient, no student input yet.
  if (body.intro === true) {
    const raw = await complete(
      cfg,
      [{ role: "system", content: introPrompt(locale) }],
      400,
      0.6,
    );
    const output = raw ? parseLLMOutput(raw) : null;
    if (!output) {
      return Response.json({
        turn: [
          {
            role: "nurse",
            text: `${t.s.introPrefix}${t.s.routeIntro(c.patient.name, String(c.patient.age))}`,
            kind: "ack",
            scene: SCENES.admit,
          },
        ],
        state,
        hint: null,
      });
    }
    return Response.json({
      turn: [
        {
          role: "nurse",
          text: output.text,
          kind: "ack",
          scene: SCENES.admit,
        },
      ],
      state,
      hint: output.hint ?? null,
    });
  }

  if (!input || input.length > 1000) {
    return Response.json({ error: "invalid input" }, { status: 400 });
  }

  const systemPromptText = systemPrompt(
    history,
    coveredIds,
    turnCount,
    o2Started,
    escalated,
    turnsSinceEscalation,
    locale,
  );

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPromptText },
  ];
  for (const t of history) {
    messages.push({
      role: t.role === "student" ? "user" : "assistant",
      content: t.text,
    });
  }
  messages.push({ role: "user", content: input });

  const raw = await complete(cfg, messages, 500);
  if (!raw) {
    return Response.json({ error: "upstream unreachable" }, { status: 503 });
  }

  const output = parseLLMOutput(raw);
  if (!output) {
    // Retry once for JSON slips
    const raw2 = await complete(cfg, messages, 500);
    const output2 = raw2 ? parseLLMOutput(raw2) : null;
    if (!output2) return dodge(state, turnCount, locale, coveredIds);
    return buildResponse(output2, state, turnCount, locale, coveredIds);
  }

  return buildResponse(output, state, turnCount, locale, coveredIds);
}

function labsDelivery(state: SessionState, locale: "en" | "fa"): {
  state: SessionState;
  turns: TurnMsg[];
} {
  const t = dictFor(locale);
  const labsScene = computeScene(state);
  return {
    state,
    turns: [
      {
        role: "nurse",
        text: t.s.labsReady,
        kind: "labs-ready",
        hero: "nurse-labs",
        scene: labsScene,
      },
      {
        role: "system",
        text: dictFor(locale).chart.labsTitle,
        kind: "labs",
        card: "labs",
        factId: "labs-panel",
        scene: labsScene,
      },
      {
        role: "nurse",
        text: t.s.abgLine,
        kind: "abg",
        hero: "nurse-labs",
        scene: labsScene,
      },
    ],
  };
}

function buildResponse(
  output: LLMOutput,
  state: SessionState,
  turnCount = 0,
  locale: "en" | "fa" = "en",
  coveredIds: string[] = [],
): Response {
  const t = dictFor(locale);
  const newState = advance(state, output.directives, output.directives.facts_covered);
  const newScene = computeScene(newState, turnCount + 1);
  // Facts elicited so far (documented in the chart, scored in the review).
  const newCoveredIds = mergeCoveredIds(coveredIds, output.directives.facts_covered);
  const main: TurnMsg = {
    role: output.role,
    text: output.text,
    kind: output.kind === "interjection" ? "interjection" : "reply",
    scene: newScene,
  };
  const turn: TurnMsg[] = [main];
  // Nurse's own speech already acknowledges orders; only synthesize the
  // action card, never a duplicate ack.
  const needAck = output.role !== "nurse";

  // If LLM declares oxygen_started and we haven't already, add action card
  if (output.directives.oxygen_started && !state.o2Started) {
    if (needAck)
      turn.push({ role: "nurse", text: t.s.ack, kind: "ack", scene: newScene });
    turn.push({
      role: "system",
      text: t.s.oxygenStarted,
      kind: "action",
      card: "o2",
      scene: newScene,
    });
    return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
  }

  // If LLM declares labs_requested
  if (output.directives.labs_requested && !state.labsRequested) {
    if (needAck)
      turn.push({ role: "nurse", text: t.s.ackDoctor, kind: "ack", scene: newScene });
    return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
  }

  // If LLM declares ecg_done
  if (output.directives.ecg_done && !state.ecgDone) {
    if (needAck)
      turn.push({ role: "nurse", text: t.s.done, kind: "ack", scene: newScene });
    turn.push({
      role: "system",
      text: t.s.ecgReceived,
      kind: "image",
      card: "ecg",
      scene: newScene,
    });
    if (newState.ecgDone && newState.cxrDone && !newState.labsDelivered) {
      const delivered = labsDelivery({ ...newState, labsDelivered: true }, locale);
      turn.push(...delivered.turns);
      return Response.json({ turn, state: delivered.state, coveredIds: newCoveredIds, hint: output.hint ?? null });
    }
    return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
  }

  // If LLM declares cxr_done
  if (output.directives.cxr_done && !state.cxrDone) {
    if (needAck)
      turn.push({ role: "nurse", text: t.s.takingNow, kind: "ack", scene: newScene });
    turn.push({
      role: "system",
      text: t.s.cxrReceived,
      kind: "image",
      card: "cxr",
      scene: newScene,
    });
    if (newState.ecgDone && newState.cxrDone && !newState.labsDelivered) {
      const delivered = labsDelivery({ ...newState, labsDelivered: true }, locale);
      turn.push(...delivered.turns);
      return Response.json({ turn, state: delivered.state, coveredIds: newCoveredIds, hint: output.hint ?? null });
    }
    return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
  }

  // If LLM declares dx_ordered
  if (output.directives.dx_ordered && !state.dxOrdered) {
    if (needAck)
      turn.push({ role: "nurse", text: t.s.ackDoctor, kind: "ack", scene: newScene });
    turn.push(
      {
        role: "system",
        text: t.s.abxOrdered,
        kind: "action",
        card: "abx",
        scene: newScene,
      },
      {
        role: "nurse",
        text: t.s.escalationNurse1,
        kind: "escalation",
        scene: newScene,
      },
      {
        role: "patient",
        text: t.s.distressPatient,
        kind: "distress",
        scene: newScene,
      },
      {
        role: "nurse",
        text: t.s.escalationNurse2,
        kind: "escalation",
        scene: newScene,
      },
      {
        role: "system",
        text: t.s.vitalsMid,
        kind: "vitals",
        card: "vitalsMid",
        scene: newScene,
      },
    );
    return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
  }

  // If LLM declares icu_ordered
  if (output.directives.icu_ordered && !state.icuOrdered) {
    if (needAck)
      turn.push({ role: "nurse", text: t.s.ack, kind: "ack", scene: newScene });
    turn.push({
      role: "system",
      text: t.s.icuReady,
      kind: "action",
      card: "icu",
      scene: SCENES.review,
    });
    return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
  }

  // Default: just the LLM's reply
  return Response.json({ turn, state: newState, coveredIds: newCoveredIds, hint: output.hint ?? null });
}
