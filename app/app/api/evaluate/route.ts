import { pickLocale } from "@/lib/i18n/config";
import { dictFor } from "@/lib/i18n/dict";
import { complete, llmConfig } from "@/lib/simumed/llm";
import { mockEnabled, mockReview } from "@/lib/simumed/mock-brain";
import { initialSessionState, type SessionState } from "@/lib/simumed/session";

export const dynamic = "force-dynamic";

const REVIEW_SYSTEM_FA = `تو رزیدنت ارشدی که عملکرد یک دانشجو را در یک سناریوی شبیه‌سازی‌شده مرور می‌کنی. فارسی، صمیمی و دقیق حرف بزن.

قوانین:
- فقط از اطلاعات موجود در رونوشت استفاده کن. چیزی از خودت نساز.
- feedback: یک خط گشایش گرم از زبان رزیدنت (مثل «خب دکتر، عملکردت رو با هم مرور کنیم» + یک جمله کلی درباره جلسه).
- strengths: ۲-۳ جمله کوتاه فارسی، هر کدام یک کار خوب مشخص دانشجو در این جلسه (با استناد به کاری که واقعاً کرد).
- improvements: ۲-۳ جمله کوتاه فارسی، هر کدام یک نقطه ضعف مشخص با اشاره به کار درست (چه کاری به جای آن باید می‌کرد).
- lesson: یک مروارید آموزشی ۱-۲ جمله‌ای از این کیس (مثل اولویت اکسیژن در تشدید COPD، یا ریسک احتباس CO₂ هنگام هدف‌گذاری SpO₂).
- امتیاز نهایی ۰-۱۰۰.
- امتیاز هر حوزه ۰-۱۰۰٪: History Taking, Clinical Reasoning, Investigation, Management, Communication.
- تعداد خطاها: Critical (تهدید فوری حیات), Major (انحراف مهم از پروتکل), Minor (نقص آموزشی بدون آسیب فوری).
- minorNote: اگر خطای جزئی هست، یک جمله توضیح آن.
- crs: آمادگی بالینی ۰-۱۰۰ با چهار مؤلفه (هر کدام فقط بر اساس رفتار مشاهده‌شده؛ اگر داده ناکافی است null): confidence (وضوح و قاطعیت تصمیم‌ها)، reactionSpeed (سرعت واکنش به اطلاعات مهم، همراه با دقت)، clinicalAccuracy (درستی تشخیص/تست/درمان و شناسایی red flagها)، decisionStability (ثبات منطق تصمیم، عدم تغییر تکانشی).
- stressScore: توانایی حفظ عملکرد تحت فشار ۰-۱۰۰ یا null اگر داده ناکافی است (هرگز ادعای تشخیص اضطراب نکن) + stressNotes: حداکثر ۳ رفتار مشاهده‌شده.
- diagnosticPerformance: ۰-۱۰۰ + diagnosticErrorRate: ۰-۱۰۰ یا null + importantErrors: خطاهای مهم مشاهده‌شده.
- communicationScore: مهارت ارتباطی ۰-۱۰۰ (احترام، گوش‌دادن، توضیح قابل‌فهم، professionalism).
- resilience: چهار رشته کوتاه فارسی — didWell (چه کرد خوب)، vulnerability (آسیب‌پذیری اصلی تحت فشار)، recovery (بازیابی پس از خطا/فشار)، nextChallenge (چالش بعدی پیشنهادی).
- feedbackPoints: حداکثر ۳ نکته مهم و عملی برای بهبود.
- فقط JSON بده، بدون متن اضافه:
{
  "feedback": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "lesson": "...",
  "domains": [
    {"label": "History Taking", "value": 0},
    {"label": "Clinical Reasoning", "value": 0},
    {"label": "Investigation", "value": 0},
    {"label": "Management", "value": 0},
    {"label": "Communication", "value": 0}
  ],
  "score": 0,
  "criticalErrors": 0,
  "majorErrors": 0,
  "minorErrors": 0,
  "minorNote": "...",
  "crs": {"confidence": 0, "reactionSpeed": 0, "clinicalAccuracy": 0, "decisionStability": 0},
  "stressScore": 0,
  "stressNotes": ["...", "..."],
  "diagnosticPerformance": 0,
  "diagnosticErrorRate": 0,
  "importantErrors": ["...", "..."],
  "communicationScore": 0,
  "resilience": {"didWell": "...", "vulnerability": "...", "recovery": "...", "nextChallenge": "..."},
  "feedbackPoints": ["...", "...", "..."]
}`;

const REVIEW_SYSTEM_EN = `You are the senior resident reviewing a student's performance in a simulated scenario. Speak English — warm, direct, precise.

Rules:
- Use ONLY what is in the transcript. Invent nothing.
- feedback: one warm opening line in the resident's voice (like "Alright Doctor, let's go over how you did" + one general sentence about the session).
- strengths: 2-3 short English sentences, each one specific thing the student did well in this session (citing what they actually did).
- improvements: 2-3 short English sentences, each a specific weakness paired with the correct action (what they should have done instead).
- lesson: one 1-2 sentence teaching pearl from this case (e.g. oxygen comes first in a COPD exacerbation, or the risk of CO₂ retention when targeting SpO₂).
- Final score 0-100.
- Domain scores 0-100% each: History Taking, Clinical Reasoning, Investigation, Management, Communication.
- Error counts: Critical (immediate threat to life), Major (significant deviation from protocol), Minor (teaching gap without immediate harm).
- minorNote: if there are minor errors, one sentence explaining them.
- crs: clinical readiness 0-100 with four components (each based ONLY on observed behaviour; null if data is insufficient): confidence (clarity and decisiveness of decisions), reactionSpeed (speed of reaction to important findings, with accuracy), clinicalAccuracy (correctness of diagnosis/tests/treatment and recognition of red flags), decisionStability (stability of decision logic, no impulsive swings).
- stressScore: ability to maintain performance under pressure 0-100, or null if data is insufficient (never claim an anxiety diagnosis) + stressNotes: up to 3 observed behaviours.
- diagnosticPerformance: 0-100 + diagnosticErrorRate: 0-100 or null + importantErrors: important errors observed.
- communicationScore: communication skill 0-100 (respect, listening, understandable explanations, professionalism).
- resilience: four short English strings — didWell (what went well), vulnerability (main vulnerability under pressure), recovery (bounce-back after errors/pressure), nextChallenge (suggested next challenge).
- feedbackPoints: up to 3 key, actionable improvement points.
- Return JSON only, no extra text:
{
  "feedback": "...",
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "lesson": "...",
  "domains": [
    {"label": "History Taking", "value": 0},
    {"label": "Clinical Reasoning", "value": 0},
    {"label": "Investigation", "value": 0},
    {"label": "Management", "value": 0},
    {"label": "Communication", "value": 0}
  ],
  "score": 0,
  "criticalErrors": 0,
  "majorErrors": 0,
  "minorErrors": 0,
  "minorNote": "...",
  "crs": {"confidence": 0, "reactionSpeed": 0, "clinicalAccuracy": 0, "decisionStability": 0},
  "stressScore": 0,
  "stressNotes": ["...", "..."],
  "diagnosticPerformance": 0,
  "diagnosticErrorRate": 0,
  "importantErrors": ["...", "..."],
  "communicationScore": 0,
  "resilience": {"didWell": "...", "vulnerability": "...", "recovery": "...", "nextChallenge": "..."},
  "feedbackPoints": ["...", "...", "..."]
}`;

interface EvalBody {
  transcript?: unknown;
  coveredIds?: unknown;
  locale?: unknown;
  state?: unknown;
}

function parseEvalOutput(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(raw.slice(start, end + 1));
    if (typeof obj !== "object" || obj === null) return null;
    return obj;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: EvalBody = {};
  try {
    body = (await request.json()) as EvalBody;
  } catch {
    body = {};
  }

  const locale = pickLocale(body.locale, request.headers.get("cookie"));
  const t = dictFor(locale);
  const reviewSystem = locale === "fa" ? REVIEW_SYSTEM_FA : REVIEW_SYSTEM_EN;

  const transcript = typeof body.transcript === "string" ? body.transcript : "";
  const coveredIds = Array.isArray(body.coveredIds)
    ? body.coveredIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!transcript) {
    return Response.json({ error: "no transcript" }, { status: 400 });
  }

  // Deterministic demo review (SIMUMED_MOCK_LLM=1), computed from observed
  // session state instead of an LLM call.
  const mockState: SessionState = {
    ...initialSessionState(),
    ...((body.state && typeof body.state === "object" && !Array.isArray(body.state)
      ? (body.state as SessionState)
      : {}) as Partial<SessionState>),
  };
  if (!llmConfig() && mockEnabled()) {
    return Response.json(mockReview(coveredIds, mockState, locale));
  }

  const cfg = llmConfig();
  if (!cfg) {
    return Response.json({ error: "LLM not configured" }, { status: 503 });
  }

  const coverageNote =
    locale === "fa" ? "شناسه‌های پوشش‌داده‌شده" : "Covered fact IDs";
  const summary = `Session transcript:\n${transcript}\n\n${coverageNote}: ${coveredIds.join(", ") || "none"}`;

  const raw = await complete(
    cfg,
    [
      { role: "system", content: reviewSystem },
      { role: "user", content: summary },
    ],
    800,
  );

  if (!raw) {
    return Response.json({ error: "upstream unreachable" }, { status: 503 });
  }

  const parsed = parseEvalOutput(raw);
  if (!parsed) {
    return Response.json({
      feedback: t.s.evalFallback,
      strengths: [],
      improvements: [],
      lesson: "",
      domains: [
        { label: "History Taking", value: 0 },
        { label: "Clinical Reasoning", value: 0 },
        { label: "Investigation", value: 0 },
        { label: "Management", value: 0 },
        { label: "Communication", value: 0 },
      ],
      score: 0,
      criticalErrors: 0,
      majorErrors: 0,
      minorErrors: 0,
      minorNote: "",
      crs: null,
      stressScore: null,
      stressNotes: [],
      diagnosticPerformance: null,
      diagnosticErrorRate: null,
      importantErrors: [],
      communicationScore: null,
      resilience: null,
      feedbackPoints: [],
    });
  }

  return Response.json(parsed);
}
