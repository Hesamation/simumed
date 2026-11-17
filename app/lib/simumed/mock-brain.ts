import type { Locale } from "@/lib/i18n/config";
import { localeNum } from "@/lib/i18n/format";
import { caseFor } from "./case-data";
import type { LLMOutput } from "./llm-contract";
import type { SessionState } from "./session";

/**
 * Deterministic demo brain, enabled only by `SIMUMED_MOCK_LLM=1`. It powers
 * the offline demo (README GIF) and local development without provider
 * credentials: orders are keyword-matched, history questions are answered
 * with the canonical case lines, and the review is computed from observed
 * session state. Never used in production unless explicitly opted in.
 */

export function mockEnabled(): boolean {
  return process.env.SIMUMED_MOCK_LLM?.trim() === "1";
}

const ORDERS: { key: keyof LLMOutput["directives"]; re: RegExp }[] = [
  {
    key: "icu_ordered",
    re: /\bicu\b|intensive care|respiratory support|مراقبت ?های ویژه|حمایت تنفسی|آماده.?باش/i,
  },
  {
    key: "dx_ordered",
    re: /antibiotic|admission|admit|hospitaliz|آنتی‌بیوتیک|بستری/i,
  },
  {
    key: "labs_requested",
    re: /\blabs?\b|\bcbc\b|blood (test|gas)|\babg\b|lactate|آزمایش|گاز خون|لاکتات/i,
  },
  {
    key: "ecg_done",
    re: /\becg\b|electrocardiogram|نوار قلب/i,
  },
  {
    key: "cxr_done",
    re: /x-?ray|\bcxr\b|radiograph|عکس قفسه|گرافی/i,
  },
  {
    key: "oxygen_started",
    re: /oxygen|\bo2\b|اکسیژن/i,
  },
];

const STOP = new Set([
  "the","a","an","is","are","was","were","do","does","did","you","your","he",
  "his","have","has","had","and","or","of","to","in","on","for","with","what",
  "any","tell","me","about","please","doctor","dr","hi","hello","can","could",
  "would","will","how","long","much","many","this","that","it","its","from",
  "been","like","got","take","taking","know","want","need","really","just",
  "going","doing","some","more","very","since","also",
  "از","به","با","که","در","را","ایا","آیا","و","شما","شماست","برای","دکتر",
  "دكتر","ایشان","او","را","رو","چی","چه","چطور","خب","لطفا","لطفاً","سلام",
  "است","هست","بوده","دارد","دارید","می","را",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

/** Best-matching fact id for a history question, by word overlap with the
 *  fact id and the canonical answer. Null when nothing matches (callers emit
 *  the dodge). */
export function bestFactId(input: string, locale: Locale): string | null {
  const tokens = tokenize(input);
  if (tokens.length === 0) return null;
  let best: { id: string; score: number } | null = null;
  for (const f of caseFor(locale).facts) {
    const answer = f.answer.toLowerCase();
    const idWords = f.id.replace(/-/g, " ");
    let score = 0;
    for (const t of tokens) {
      if (answer.includes(t)) score += 1;
      else if (idWords.includes(t)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { id: f.id, score };
    }
  }
  return best ? best.id : null;
}

export function mockIntro(locale: Locale): string {
  const c = caseFor(locale);
  if (locale === "fa") {
    const n = (v: number | string) => localeNum("fa", v);
    return `دکتر، ${c.patient.name}، ${n(c.patient.age)} ساله، با تنگی نفس شدید اومده. میگه از صبح حالش بدتر شده و الان واقعاً نفسم بالا نمیاد. SpO₂ هشتاد و شش درصده بدون اکسیژن، تنفسش ${n(c.vitals.rr)} در دقیقه، تب هم ${n("38.4")} داره؛ این اشباع خیلی نگرانم کرده.`;
  }
  return `Doctor, ${c.patient.name}, sixty-eight, came in with severe shortness of breath. He says it got much worse this morning and now he can't catch his breath at all. SpO₂ is eighty-six percent without oxygen, RR thirty-two, temp thirty-eight-four — that saturation worries me.`;
}

export function mockDecide(
  input: string,
  locale: Locale,
): LLMOutput {
  const c = caseFor(locale);

  for (const o of ORDERS) {
    if (o.re.test(input)) {
      const directives = { [o.key]: true } as LLMOutput["directives"];
      if (o.key === "labs_requested") {
        // The canonical labs panel is delivered through the deterministic
        // labs trigger; the mock claims it as a covered fact so the review
        // sees it.
        directives.facts_covered = ["labs-panel"];
      }
      return {
        role: "nurse",
        kind: "reply",
        text: locale === "fa" ? "چشم دکتر." : "Right away, Doctor.",
        hint: null,
        directives,
      };
    }
  }

  const factId = bestFactId(input, locale);
  if (factId) {
    const fact = c.facts.find((f) => f.id === factId)!;
    return {
      role: "patient",
      kind: "reply",
      text: fact.answer,
      hint: null,
      directives: { facts_covered: [factId] },
    };
  }

  return {
    role: "patient",
    kind: "reply",
    text: locale === "fa"
      ? "راستش این مورد رو دقیق نمی‌دونم؛ چیزی بهم نگفته."
      : "Honestly, I'm not sure about that one; he hasn't told me anything about it.",
    hint: null,
    directives: {},
  };
}

export interface MockReview {
  feedback: string;
  strengths: string[];
  improvements: string[];
  lesson: string;
  domains: { label: string; value: number }[];
  score: number;
  criticalErrors: number;
  majorErrors: number;
  minorErrors: number;
  minorNote: string;
  crs: {
    confidence: number;
    reactionSpeed: number;
    clinicalAccuracy: number;
    decisionStability: number;
  } | null;
  stressScore: number | null;
  stressNotes: string[];
  diagnosticPerformance: number | null;
  diagnosticErrorRate: number | null;
  importantErrors: string[];
  communicationScore: number | null;
  resilience: {
    didWell: string;
    vulnerability: string;
    recovery: string;
    nextChallenge: string;
  } | null;
  feedbackPoints: string[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function mockReview(
  coveredIds: string[],
  state: SessionState,
  locale: Locale,
): MockReview {
  const facts = caseFor(locale).facts;
  const historyCount = coveredIds.filter((id) => id !== "labs-panel").length;
  const coverage = clamp((historyCount / facts.length) * 100);
  const investigations =
    (state.labsRequested ? 40 : 0) + (state.ecgDone ? 25 : 0) + (state.cxrDone ? 25 : 0);
  const management = state.icuOrdered ? 90 : state.dxOrdered ? 70 : 25;
  const score = clamp(
    coverage * 0.4 +
      (state.o2Started ? 20 : 0) +
      investigations * 0.2 +
      management * 0.2,
  );

  const criticalErrors = state.o2Started ? 0 : 1;
  const majorErrors = state.dxOrdered ? 0 : 1;
  const minorErrors = state.ecgDone && state.cxrDone ? 0 : 1;

  const fa = locale === "fa";
  return {
    feedback: fa
      ? "خب دکتر، عملکردت رو با هم مرور کنیم. جلسه پرکاربردی بود؛ بیا سراغ جزئیات."
      : "Alright Doctor, let's go over how you did. It was a solid session; let's look at the details.",
    strengths: [
      fa
        ? (state.o2Started ? "اکسیژن را سریع شروع کردی — اولویت درست." : "گرفتن شرح حال سیستماتیک بود.")
        : (state.o2Started ? "You started oxygen promptly — the right priority." : "Your history taking was systematic."),
      fa ? "پرسش‌هایت هدفمند بود." : "Your questions were focused.",
    ],
    improvements: [
      fa
        ? (state.o2Started ? "می‌توانستی زودتر آزمایش و گرافی بخواهی." : "با SpO₂ ۸۶٪، اکسیژن اولویت اول بود، نه شرح حال.")
        : (state.o2Started ? "You could have ordered labs and imaging earlier." : "With SpO₂ at 86%, oxygen came first — not the history."),
      fa
        ? (state.dxOrdered ? "قبل از بستری، پاسخ به درمان را پایش کن." : "آنتی‌بیوتیک و بستری را دیرتر سفارش دادی.")
        : (state.dxOrdered ? "Monitor the response to treatment before admission." : "Antibiotics and admission came late."),
    ],
    lesson: fa
      ? "در تشدید COPD، اکسیژن‌درمانی اولویت اول است؛ هدف SpO₂ ۸۸-۹۲٪ و مراقبت از احتباس CO₂."
      : "In a COPD exacerbation oxygen comes first: target SpO₂ 88–92% and watch for CO₂ retention.",
    domains: [
      { label: "History Taking", value: coverage },
      { label: "Clinical Reasoning", value: clamp((coverage + (state.o2Started ? 100 : 30)) / 2) },
      { label: "Investigation", value: clamp(investigations) },
      { label: "Management", value: clamp(management) },
      { label: "Communication", value: 72 },
    ],
    score,
    criticalErrors,
    majorErrors,
    minorErrors,
    minorNote: fa ? "معاینه کامل قلب-ریه ثبت نشد." : "Full cardio-respiratory exam documentation was incomplete.",
    crs: {
      confidence: 70,
      reactionSpeed: state.o2Started ? 80 : 55,
      clinicalAccuracy: clamp((coverage + management) / 2),
      decisionStability: 75,
    },
    stressScore: 65,
    stressNotes: [],
    diagnosticPerformance: clamp((coverage * 0.5 + management * 0.5)),
    diagnosticErrorRate: clamp(100 - (coverage * 0.5 + management * 0.5)),
    importantErrors: criticalErrors
      ? [fa ? "شروع تاخیری اکسیژن در بیمار هیپوکسمیک" : "Delayed oxygen in a hypoxaemic patient"]
      : [],
    communicationScore: 72,
    resilience: {
      didWell: fa ? "حفظ ساختار مصاحبه تحت فشار" : "Kept the interview structured under pressure",
      vulnerability: fa ? "تردید در اولویت‌گذاری درمان" : "Hesitation in prioritising treatment",
      recovery: fa ? "بازگشت خوب پس از یادآوریSpO₂" : "Recovered well once the SpO₂ was flagged",
      nextChallenge: fa ? "سناریوی آسم با الگوی انسداد متغیر" : "An asthma scenario with a variable obstruction pattern",
    },
    feedbackPoints: [
      fa ? "اول اکسیژن، بعد شرح حال." : "Oxygen first, then the history.",
      fa ? "گاز خون را با آزمایش خون معمول بخواه." : "Order the blood gas alongside the routine labs.",
    ],
  };
}
