import type { Locale } from "./config";

/**
 * Typed UI dictionary. `en` is the source of truth for the key shape; the
 * `fa` locale is type-checked against it (a missing key is a compile error)
 * and a runtime completeness test guards both directions. Persian strings
 * are the original UI text, preserved verbatim.
 */

const en = {
  meta: {
    title: "SimuMed | Clinical Interview Simulator",
    description: "A clinical interview simulator with a virtual patient",
    appleTitle: "SimuMed",
  },
  manifest: {
    name: "SimuMed | Clinical Interview Simulator",
    shortName: "SimuMed",
    description:
      "A clinical interview simulator with a virtual patient for medical students",
  },
  app: {
    title: "SimuMed | Clinical Interview Simulator",
    subtitle: "A clinical interview simulator with a virtual patient",
    erBadge: "Emergency department",
    chartButton: "Chart",
    chartShowAria: "Show patient chart",
    chartHideAria: "Hide patient chart",
    restartAria: "Restart the interview",
  },
  theme: {
    toggleAria: "Toggle theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  localeSwitch: {
    aria: "Switch language",
    en: "English",
    fa: "فارسی",
  },
  tabs: {
    interview: "Interview",
    exam: "Examination",
  },
  start: {
    line1: "The patient has been admitted to the emergency department and is waiting for you.",
    line2: "Press the button below to begin the interview.",
    button: "Start",
    vitalsSummary: (v: { rr: string; spo2: string; hr: string; sys: string; dia: string; temp: string }) =>
      `Vital signs — RR ${v.rr}, SpO₂ ${v.spo2}%, HR ${v.hr}, BP ${v.sys}/${v.dia}, temp ${v.temp}°C`,
  },
  chat: {
    placeholder: "Ask the patient a question…",
    send: "Send",
    typingAria: "The patient is responding",
    hintLabel: "Hint",
    hintClose: "Close",
    hintAria: "Hint",
    fallbackAck: "Sorry, I didn't catch that — could you say it again?",
    clientIntro: (name: string, age: string) =>
      `Doctor, ${name}, ${age} years old. Came in with severe shortness of breath. Says he can't catch his breath.`,
  },
  roles: {
    student: "Student",
    nurse: "Nurse",
    resident: "Senior resident",
    feedbackChip: "Feedback",
  },
  scene: {
    admit: "Patient arrival",
    history: "Focused history",
    investigation: "Investigations",
    results: "Lab results",
    decision: "Clinical decision",
    review: "Resident review",
    score: "Final score",
    end: "End",
  },
  hero: {
    nurseTriage: {
      alt: "Nurse at the emergency department triage",
      caption: "Nurse — ED triage",
      title: "Patient arrival",
    },
    nurseLabs: {
      alt: "Nurse holding the lab results",
      caption: "Nurse — lab results",
      title: "Investigations",
    },
    resident: {
      alt: "Senior resident",
      caption: "Senior resident",
      title: "Feedback",
    },
  },
  vitals: {
    cardTitle: "📟 Vital signs — triage sheet",
    rr: "Respiratory rate",
    perMin: "/min",
    spo2: "SpO2",
    hr: "Heart rate",
    bp: "Blood pressure",
    temp: "Temperature",
  },
  chart: {
    patientDesc: (sex: string, age: string, job: string) => `${sex}, ${age} — ${job}`,
    patientMeta: (marital: string, children: string, residence: string) =>
      `${marital}, ${children} children — lives in ${residence}`,
    vitalsTitle: "Vital signs",
    vitalsDesc: "Admission triage sheet",
    labsTitle: "Labs and blood gas",
    labsDesc: "Paraclinical findings on file",
    docsTitle: "Interview documentation",
    docsDesc: "Findings elicited from the patient so far",
    docsEmpty:
      "Nothing documented yet; whatever the patient reveals during the interview is recorded here.",
  },
  docGroups: {
    identity: "Identity",
    respiratory: "Respiratory history",
    associated: "Associated symptoms",
    history: "Medical & family history",
    meds: "Medications & adherence",
    allergy: "Allergies",
    habits: "Habits & environmental exposures",
  },
  exam: {
    hint: "Select a maneuver to record its finding here; greyed-out sections are not defined in this version.",
    progress: (revealed: string, total: string) => `${revealed} of ${total}`,
    undefinedTitle: "Sections not defined",
    undefinedDesc: "The current scenario has no findings designed for these sections",
    undefinedBadge: "Undefined",
  },
  examGroups: {
    general: "General inspection & skin",
    neck: "Neck",
    chest: "Chest",
    heart: "Heart",
    abdomen: "Abdomen",
  },
  examUndefined: [
    "Ears, nose and throat (HEENT)",
    "Extremities (clubbing, edema)",
    "Neurological examination",
  ],
  review: {
    title: "Final report card",
    legend:
      "Error classes: Critical = immediate threat to life · Major = significant deviation from protocol · Minor = teaching gap without immediate harm",
    scoreLine: (score: string) => `CLINICAL SCORE: ${score}/100`,
    errs: {
      critical: { label: "Critical", alt: "بحرانی" },
      major: { label: "Major", alt: "عمده" },
      minor: { label: "Minor", alt: "جزئی" },
    },
    subs: {
      criticalNone: "Life-threatening — none ✓",
      criticalSome: "Immediate threat to life",
      majorNone: "Major deviation — none ✓",
      majorSome: "Significant protocol deviation",
      minorNone: "Teaching gap — none ✓",
      minorSome: "Teaching gap",
    },
    verdict: (score: number): string => {
      if (score >= 85) return "Excellent performance — keep this up";
      if (score >= 70) return "Good performance — a few small corrections and it will be excellent";
      if (score >= 55) return "Acceptable — take the improvement points seriously";
      return "Needs more practice — reviewing the fundamentals is recommended";
    },
    crsTitle: "Clinical readiness (CRS)",
    crs: {
      confidence: "Confidence",
      reactionSpeed: "Reaction speed",
      clinicalAccuracy: "Clinical accuracy",
      decisionStability: "Decision stability",
    },
    stress: "Stress",
    diagnosis: "Diagnosis",
    communication: "Communication",
    threePoints: "Three points from the resident",
    reportButton: "📄 Formal report",
    intro: "Alright Doctor, let's go over how you did.",
    lessonPrefix: "💡 Pearl: ",
  },
  modal: {
    aria: "Formal performance report",
    title: "Educational performance report — SimuMed",
    scenario: (date: string) => `Scenario: ED triage — COPD exacerbation · ${date}`,
    finalScore: "Final clinical score",
    scoreValue: (score: string) => `${score} out of 100`,
    crsRow: (label: string) => `Clinical readiness — ${label}`,
    domainRow: (label: string) => `Domain: ${label}`,
    communication: "Communication skill",
    stress: "Performance under pressure",
    diagnostic: "Diagnostic performance",
    errorsRow: "Errors (critical / major / minor)",
    residentPoints: "Senior resident's points",
    disclaimer:
      "This report is for educational purposes only and is not a formal clinical assessment.",
    print: "Print",
    close: "Close",
  },
  sheet: {
    title: "Patient chart",
    description: "Identity, admission triage and interview documentation",
  },
  login: {
    title: "SimuMed | Clinical Interview Simulator",
    description: "Enter the password to sign in.",
    placeholder: "Password",
    errorRate: "Too many attempts; please try again in a few minutes.",
    errorWrong: "Incorrect password.",
    errorNet: "Connection error; please try again.",
    busy: "Checking…",
    submit: "Sign in",
  },
  install: {
    iosPre: "To install: in Safari tap ",
    iosShare: "Share",
    iosMid: " → ",
    iosAdd: "Add to Home Screen",
    iosPost: " — it also works offline afterwards.",
    banner: "Install SimuMed — it works offline once installed.",
    button: "Install",
    menuHint: "From the ⋮ menu → Install app",
    closeAria: "Close",
  },
  /** Server-side strings used by the API routes (acknowledgements, action
   *  cards, fallbacks). The LLM's own speech comes from the prompts, not
   *  from here. */
  s: {
    ack: "Right away.",
    ackDoctor: "Right away, Doctor.",
    done: "Done.",
    takingNow: "Getting it now.",
    oxygenStarted: "Oxygen started",
    ecgReceived: "ECG received",
    cxrReceived: "Chest X-ray received",
    abxOrdered: "Antibiotics prescribed — admission requested",
    escalationNurse1:
      "Doctor, his pressure has dropped to 90 over 58 and he is still short of breath.",
    distressPatient: "Doctor... I still can't breathe properly.",
    escalationNurse2:
      "Doctor, SpO₂ is now 89%. RR is 32. He is still in respiratory distress.",
    vitalsMid: "SpO₂ 89% — RR 32 — BP 90/58",
    icuReady: "Respiratory support standby / ICU",
    labsReady: "Doctor, the labs are back.",
    abgLine: "The ABG was already drawn: pH 7.31 — PaCO₂ 55 — PaO₂ 58",
    dodge: "Honestly, I'm not sure about that one; he hasn't told me anything about it.",
    evalFallback: "The LLM feedback could not be processed.",
    introPrefix: "Doctor, ",
    routeIntro: (name: string, age: string) =>
      `${name}, ${age} years old, came in with severe shortness of breath. Says he can't catch his breath.`,
  },
};

export type Dict = typeof en;

const fa: Dict = {
  meta: {
    title: "سیمومد | SimuMed",
    description: "شبیه‌ساز مصاحبه بالینی با بیمار مجازی",
    appleTitle: "سیمومد",
  },
  manifest: {
    name: "سیمومد | شبیه‌ساز مصاحبه بالینی",
    shortName: "سیمومد",
    description: "شبیه‌ساز مصاحبه بالینی با بیمار مجازی برای دانشجویان پزشکی",
  },
  app: {
    title: "سیمومد | SimuMed",
    subtitle: "شبیه‌ساز مصاحبه بالینی با بیمار مجازی",
    erBadge: "اتاق اورژانس",
    chartButton: "پرونده",
    chartShowAria: "نمایش پرونده",
    chartHideAria: "بستن پرونده",
    restartAria: "شروع دوباره مصاحبه",
  },
  theme: {
    toggleAria: "تغییر پوسته",
    light: "روشن",
    dark: "تیره",
    system: "سیستم",
  },
  localeSwitch: {
    aria: "تغییر زبان",
    en: "English",
    fa: "فارسی",
  },
  tabs: {
    interview: "مصاحبه",
    exam: "معاینه",
  },
  start: {
    line1: "بیمار در اورژانس پذیرش شده و منتظر شماست.",
    line2: "برای شروع مصاحبه، دکمهٔ زیر را بزنید.",
    button: "شروع",
    vitalsSummary: (v) =>
      `علائم حیاتی — تنفس ${v.rr}، SpO₂ ${v.spo2}٪، نبض ${v.hr}، فشار ${v.sys}/${v.dia}، تب ${v.temp}`,
  },
  chat: {
    placeholder: "سؤالت را از بیمار بپرس…",
    send: "ارسال",
    typingAria: "بیمار در حال پاسخ است",
    hintLabel: "راهنما",
    hintClose: "بستن",
    hintAria: "راهنما",
    fallbackAck: "ببخشید، متوجه نشدم؛ لطفاً دوباره بگید.",
    clientIntro: (name, age) =>
      `دکتر، ${name}، ${age} ساله. با تنگی نفس شدید اومده. میگه نفسش بالا نمیاد.`,
  },
  roles: {
    student: "دانشجو",
    nurse: "پرستار",
    resident: "رزیدنت ارشد",
    feedbackChip: "بازخورد",
  },
  scene: {
    admit: "ورود بیمار",
    history: "شرح حال سریع",
    investigation: "درخواست Investigation",
    results: "نتایج آزمایش",
    decision: "تصمیم بالینی",
    review: "مرور رزیدنت",
    score: "نمره نهایی",
    end: "پایان",
  },
  hero: {
    nurseTriage: {
      alt: "پرستار در تریاژ اورژانس",
      caption: "پرستار — تریاژ اورژانس",
      title: "ورود بیمار",
    },
    nurseLabs: {
      alt: "پرستار با نتایج آزمایش",
      caption: "پرستار — نتایج آزمایش",
      title: "پاراکلینیک",
    },
    resident: {
      alt: "رزیدنت ارشد",
      caption: "رزیدنت ارشد",
      title: "بازخورد",
    },
  },
  vitals: {
    cardTitle: "📟 علائم حیاتی — برگه تریاژ",
    rr: "تعداد تنفس",
    perMin: "در دقیقه",
    spo2: "SpO2",
    hr: "نبض",
    bp: "فشار خون",
    temp: "درجه حرارت",
  },
  chart: {
    patientDesc: (sex, age, job) => `${sex}، ${age} ساله — ${job}`,
    patientMeta: (marital, children, residence) =>
      `${marital}، ${children} فرزند — ساکن ${residence}`,
    vitalsTitle: "علائم حیاتی",
    vitalsDesc: "برگه تریاژ ورود",
    labsTitle: "آزمایش‌ها و گاز خون",
    labsDesc: "یافته‌های پاراکلینیک پرونده",
    docsTitle: "مستندسازی مصاحبه",
    docsDesc: "یافته‌هایی که تا اینجا از بیمار گرفته شده",
    docsEmpty:
      "هنوز یافته‌ای مستند نشده؛ با پرسش‌گیری، هر یافته‌ای که بیمار بگوید همین‌جا ثبت می‌شود.",
  },
  docGroups: {
    identity: "هویت",
    respiratory: "شرح حال تنفسی",
    associated: "علائم همراه",
    history: "سابقه پزشکی و خانواده",
    meds: "داروها و پیروی درمانی",
    allergy: "آلرژی",
    habits: "عادات و عوامل محیطی",
  },
  exam: {
    hint: "هر مانور را انتخاب کنید تا یافته‌اش همین‌جا ثبت شود؛ بخش‌های خاکستری در این نسخه هنوز تعریف نشده‌اند.",
    progress: (revealed, total) => `${revealed} از ${total}`,
    undefinedTitle: "بخش‌های تعریف‌نشده",
    undefinedDesc: "برای این بخش‌ها در سناریوی فعلی یافته‌ای طراحی نشده است",
    undefinedBadge: "تعریف نشده",
  },
  examGroups: {
    general: "مشاهده عمومی و پوست",
    neck: "گردن",
    chest: "قفسه سینه",
    heart: "قلب",
    abdomen: "شکم",
  },
  examUndefined: [
    "گوش، حلق و بینی (HEENT)",
    "اندام‌ها (کلابینگ، ادم)",
    "معاینه عصبی",
  ],
  review: {
    title: "کارنامه نهایی",
    legend:
      "طبقه‌بندی خطاها: بحرانی = خطر فوری حیات · عمده = انحراف مهم از پروتکل · جزئی = نقص آموزشی بدون آسیب فوری",
    scoreLine: (score) => `CLINICAL SCORE: ${score}/۱۰۰`,
    errs: {
      critical: { label: "بحرانی", alt: "Critical" },
      major: { label: "عمده", alt: "Major" },
      minor: { label: "جزئی", alt: "Minor" },
    },
    subs: {
      criticalNone: "تهدید حیات — ندارد ✓",
      criticalSome: "تهدید فوری حیات",
      majorNone: "انحراف مهم — ندارد ✓",
      majorSome: "انحراف مهم از پروتکل",
      minorNone: "نقص آموزشی — ندارد ✓",
      minorSome: "نقص آموزشی",
    },
    verdict: (score) => {
      if (score >= 85) return "عملکرد عالی — همین مسیر را ادامه بده";
      if (score >= 70) return "عملکرد خوب — با چند اصلاح کوچک عالی می‌شود";
      if (score >= 55) return "قابل قبول — نقاط بهبود را جدی بگیر";
      return "نیازمند تمرین بیشتر — مرور دوبارهٔ اصول توصیه می‌شود";
    },
    crsTitle: "آمادگی بالینی (CRS)",
    crs: {
      confidence: "اعتمادبه‌نفس",
      reactionSpeed: "سرعت واکنش",
      clinicalAccuracy: "دقت بالینی",
      decisionStability: "ثبات تصمیم",
    },
    stress: "استرس",
    diagnosis: "تشخیص",
    communication: "ارتباط",
    threePoints: "سه نکته رزیدنت",
    reportButton: "📄 گزارش رسمی",
    intro: "خب دکتر، عملکردت رو با هم مرور کنیم.",
    lessonPrefix: "💡 نکته: ",
  },
  modal: {
    aria: "گزارش رسمی عملکرد",
    title: "گزارش عملکرد آموزشی — SimuMed",
    scenario: (date) => `سناریو: تریاژ اورژانس — تشدید COPD · ${date}`,
    finalScore: "نمره نهایی بالینی",
    scoreValue: (score) => `${score} از ۱۰۰`,
    crsRow: (label) => `آمادگی بالینی — ${label}`,
    domainRow: (label) => `حوزه ${label}`,
    communication: "مهارت ارتباطی",
    stress: "عملکرد تحت فشار",
    diagnostic: "عملکرد تشخیصی",
    errorsRow: "خطاها (بحرانی / عمده / جزئی)",
    residentPoints: "نکات رزیدنت ارشد",
    disclaimer:
      "این گزارش صرفاً جنبه آموزشی دارد و جایگزین ارزیابی بالینی رسمی نیست.",
    print: "چاپ",
    close: "بستن",
  },
  sheet: {
    title: "پرونده بیمار",
    description: "اطلاعات هویتی، تریاژ ورود و مستندسازی مصاحبه",
  },
  login: {
    title: "سیمومد | SimuMed",
    description: "برای ورود گذرواژه را وارد کنید.",
    placeholder: "گذرواژه",
    errorRate: "تلاش‌های زیادی انجام شده؛ چند دقیقه بعد دوباره امتحان کنید.",
    errorWrong: "گذرواژه درست نیست.",
    errorNet: "خطای اتصال؛ دوباره امتحان کنید.",
    busy: "در حال بررسی…",
    submit: "ورود",
  },
  install: {
    iosPre: "برای نصب: در Safari روی ",
    iosShare: "Share",
    iosMid: " ← ",
    iosAdd: "Add to Home Screen",
    iosPost: " بزنید — بعدش آفلاین هم کار می‌کند.",
    banner: "سیمومد را نصب کنید — بعد از نصب، بدون اینترنت هم کار می‌کند.",
    button: "نصب",
    menuHint: "از منوی ⋮ ← نصب برنامه",
    closeAria: "بستن",
  },
  s: {
    ack: "چشم.",
    ackDoctor: "چشم دکتر.",
    done: "انجام شد.",
    takingNow: "الان می‌گیرن.",
    oxygenStarted: "اکسیژن شروع شد",
    ecgReceived: "ECG received",
    cxrReceived: "Chest X-ray received",
    abxOrdered: "آنتی‌بیوتیک تجویز شد — درخواست بستری ثبت شد",
    escalationNurse1: "دکتر، فشارش ۹۰ روی ۵۸ شده و هنوز تنگی نفس داره.",
    distressPatient: "دکتر... هنوز نمی‌تونم درست نفس بکشم.",
    escalationNurse2: "دکتر، SpO₂ الان ۸۹ درصده. RR سی‌تاست. هنوز دیسترس تنفسی داره.",
    vitalsMid: "SpO₂ ۸۹٪ — RR ۳۲ — فشار ۹۰/۵۸",
    icuReady: "آماده‌باش حمایت تنفسی / ICU",
    labsReady: "دکتر، آزمایش‌ها آماده‌ست.",
    abgLine: "ABG هم از قبل گرفته شده: pH 7.31 — PaCO₂ 55 — PaO₂ 58",
    dodge: "راستش این مورد رو دقیق نمی‌دونم؛ چیزی بهم نگفته.",
    evalFallback: "بازخورد LLM قابل پردازش نبود.",
    introPrefix: "دکتر، ",
    routeIntro: (name, age) =>
      `${name}، ${age} ساله، با تنگی نفس شدید اومده. میگه نفسش بالا نمیاد.`,
  },
};

export const DICT: Record<Locale, Dict> = { en, fa };

export function dictFor(locale: Locale): Dict {
  return DICT[locale];
}

/** Deep-check that both locales expose exactly the same leaf keys. Used by
 *  the locale-completeness test. */
export function dictLeafKeys(dict: unknown, prefix = ""): string[] {
  const keys: string[] = [];
  if (dict === null || dict === undefined) return keys;
  if (typeof dict === "object" && !Array.isArray(dict) && !(dict instanceof Map)) {
    for (const [k, v] of Object.entries(dict as Record<string, unknown>)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === "object") {
        keys.push(...dictLeafKeys(v, path));
      } else {
        keys.push(path);
      }
    }
  }
  return keys.sort();
}

/** Collect every leaf string, including the return values of template
 *  functions called with placeholder arguments. */
export function dictLeafStrings(dict: unknown): string[] {
  const out: string[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === "string") {
      out.push(v);
      return;
    }
    if (typeof v === "function") {
      // Probe template functions with digit/word placeholders.
      try {
        out.push(String((v as (...args: unknown[]) => unknown)("1", "1", "1", "1", "1", "1")));
      } catch {
        /* a function that throws on placeholders is fine — type system covers it */
      }
      return;
    }
    if (Array.isArray(v)) {
      for (const item of v) walk(item);
      return;
    }
    if (v !== null && typeof v === "object") {
      for (const item of Object.values(v as Record<string, unknown>)) walk(item);
    }
  };
  walk(dict);
  return out;
}
