"use client";

import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Lightbulb,
  MessagesSquare,
  PanelRightClose,
  PanelRightOpen,
  Play,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import type { SessionState } from "@/lib/simumed/session";
import { SCENES, initialSessionState, turnsSinceEscalation } from "@/lib/simumed/session";
import type { SceneKey } from "@/lib/simumed/session";
import type { ChatRole, ExamFinding, Fact, LabItem, Vitals } from "@/lib/simumed/types";
import { caseFor, type CaseBundle } from "@/lib/simumed/case-data";
import type { Dict } from "@/lib/i18n/dict";
import { useI18n } from "@/lib/i18n/locale-context";
import { localeDate } from "@/lib/i18n/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { ThemeToggle } from "@/components/theme-toggle";
import { InstallBanner } from "@/components/install-banner";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";

type ReplyKind =
  | "ack"
  | "action"
  | "image"
  | "interjection"
  | "labs"
  | "review";

interface CrsData {
  confidence: number;
  reactionSpeed: number;
  clinicalAccuracy: number;
  decisionStability: number;
}

interface ResilienceData {
  didWell: string;
  vulnerability: string;
  recovery: string;
  nextChallenge: string;
}

interface ReviewData {
  domains: { label: string; value: number }[];
  score: number;
  criticalErrors: number;
  majorErrors: number;
  minorErrors: number;
  minorNote?: string;
  crs?: CrsData | null;
  stressScore?: number | null;
  stressNotes?: string[];
  diagnosticPerformance?: number | null;
  diagnosticErrorRate?: number | null;
  importantErrors?: string[];
  communicationScore?: number | null;
  resilience?: ResilienceData | null;
  feedbackPoints?: string[];
}

interface Message {
  role: ChatRole | "system";
  text: string;
  kind?: ReplyKind;
  factId?: string;
  scene?: string;
  card?: string;
  hero?: string;
  review?: ReviewData;
}

const ROLE_BUBBLE: Record<string, string> = {
  student: "rounded-se-sm bg-primary text-primary-foreground",
  patient: "bg-muted",
  nurse:
    "rounded-se-sm border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100",
  resident:
    "rounded-se-sm border border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100",
};

const ROLE_ALIGN: Record<string, string> = {
  student: "self-start",
  patient: "self-end",
  nurse: "self-end",
  resident: "self-start",
};

const DOC_GROUP_IDS: { key: keyof Dict["docGroups"]; ids: string[] }[] = [
  {
    key: "identity",
    ids: ["age-sex-job", "family-status", "residence"],
  },
  {
    key: "respiratory",
    ids: [
      "chief-dyspnea",
      "dyspnea-history",
      "sentence-limit",
      "cough",
      "sputum-change",
      "hemoptysis",
      "wheeze",
      "baseline-function",
      "orthopnea-denial",
      "pnd-denial",
    ],
  },
  {
    key: "associated",
    ids: [
      "fever-feeling",
      "night-sweats",
      "night-waking",
      "uri-symptoms",
      "pleuritic-pain",
      "pain-cardiac-denial",
      "weight-loss-denial",
    ],
  },
  {
    key: "history",
    ids: [
      "copd-history",
      "htn-history",
      "no-prior-severe",
      "home-o2-denial",
      "surgery-denial",
      "family-father",
      "family-mother",
    ],
  },
  {
    key: "meds",
    ids: ["med-copd", "med-htn", "adherence"],
  },
  {
    key: "allergy",
    ids: ["allergy-penicillin", "allergy-nature"],
  },
  {
    key: "habits",
    ids: [
      "smoking-amount",
      "smoking-duration",
      "alcohol-denial",
      "drugs-denial",
      "coworker-contact",
      "welding-exposure",
      "dust-denial",
      "pets-birds",
      "stress",
    ],
  },
];

const EXAM_GROUP_IDS: { key: keyof Dict["examGroups"]; ids: string[] }[] = [
  { key: "general", ids: ["general", "skin-cyanosis"] },
  { key: "neck", ids: ["jvp", "trachea"] },
  {
    key: "chest",
    ids: ["chest-expansion", "percussion", "auscultation"],
  },
  { key: "heart", ids: ["cardiac-exam"] },
  { key: "abdomen", ids: ["abdomen"] },
];

function factsById(c: CaseBundle): Map<string, Fact> {
  return new Map(c.facts.map((f) => [f.id, f]));
}

function examById(c: CaseBundle): Map<string, ExamFinding> {
  return new Map(c.examFindings.map((e) => [e.id, e]));
}

function vitalRows(
  t: Dict,
  num: (v: number | string) => string,
  v: Vitals,
): { label: string; num: string; unit: string; critical: boolean }[] {
  return [
    { label: t.vitals.rr, num: `${num(v.rr)}`, unit: t.vitals.perMin, critical: true },
    { label: t.vitals.spo2, num: `${num(v.spo2)}%`, unit: "", critical: true },
    { label: t.vitals.hr, num: `${num(v.hr)}`, unit: t.vitals.perMin, critical: false },
    {
      label: t.vitals.bp,
      num: `${num(v.bpSystolic)}/${num(v.bpDiastolic)} mmHg`,
      unit: "",
      critical: false,
    },
    { label: t.vitals.temp, num: `${num(v.temperature)}°C`, unit: "", critical: true },
  ];
}

function SceneHero({
  src,
  alt,
  caption,
  title,
}: {
  src: string;
  alt: string;
  caption: string;
  title: string;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2 motion-safe:animate-in motion-safe:fade-in">
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-auto max-h-[42vh] w-full bg-muted/40 object-contain"
          loading="eager"
        />
        <div className="flex items-center justify-between gap-2 bg-muted/60 px-3 py-1.5 text-xs">
          <span className="font-medium leading-5">{caption}</span>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wide">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}

function SceneDivider({ title }: { title: string }) {
  return (
    <div className="flex shrink-0 items-center gap-2 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold tracking-wide text-secondary-foreground">
        {title}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function heroByKey(
  t: Dict,
): Record<string, { src: string; alt: string; caption: string; title: string }> {
  return {
    "nurse-triage": {
      src: "/case/moods/nurse_stressed.jpg",
      alt: t.hero.nurseTriage.alt,
      caption: t.hero.nurseTriage.caption,
      title: t.hero.nurseTriage.title,
    },
    "nurse-labs": {
      src: "/case/moods/nurse_wtf.jpg",
      alt: t.hero.nurseLabs.alt,
      caption: t.hero.nurseLabs.caption,
      title: t.hero.nurseLabs.title,
    },
    resident: {
      src: "/case/moods/resident_chill.jpg",
      alt: t.hero.resident.alt,
      caption: t.hero.resident.caption,
      title: t.hero.resident.title,
    },
  };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const { pct } = useI18n();
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-1">
      <span className="w-32 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      <span dir="ltr" className="w-10 shrink-0 text-right text-xs font-bold">
        {pct(value)}
      </span>
    </div>
  );
}

function ReportButton({ review }: { review: ReviewData }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
        {t.review.reportButton}
      </Button>
      {open && <FormalReportModal review={review} onClose={() => setOpen(false)} />}
    </>
  );
}

function FormalReportModal({ review, onClose }: { review: ReviewData; onClose: () => void }) {
  const { t, locale, num, pct } = useI18n();
  const today = localeDate(locale, new Date());
  const rows: [string, string][] = [
    [t.modal.finalScore, t.modal.scoreValue(num(review.score))],
    ...(review.crs
      ? [
          [t.modal.crsRow(t.review.crs.confidence), `${pct(review.crs.confidence)}`] as [string, string],
          [t.modal.crsRow(t.review.crs.reactionSpeed), `${pct(review.crs.reactionSpeed)}`] as [string, string],
          [t.modal.crsRow(t.review.crs.clinicalAccuracy), `${pct(review.crs.clinicalAccuracy)}`] as [string, string],
          [t.modal.crsRow(t.review.crs.decisionStability), `${pct(review.crs.decisionStability)}`] as [string, string],
        ]
      : []),
    ...review.domains.map(
      (d) => [t.modal.domainRow(d.label), `${pct(d.value)}`] as [string, string],
    ),
    ...(review.communicationScore != null
      ? [[t.modal.communication, `${pct(review.communicationScore)}`] as [string, string]]
      : []),
    ...(review.stressScore != null
      ? [[t.modal.stress, `${pct(review.stressScore)}`] as [string, string]]
      : []),
    ...(review.diagnosticPerformance != null
      ? [[t.modal.diagnostic, `${pct(review.diagnosticPerformance)}`] as [string, string]]
      : []),
    [
      t.modal.errorsRow,
      `${num(review.criticalErrors)} / ${num(review.majorErrors)} / ${num(review.minorErrors)}`,
    ],
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.modal.aria}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-card p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b pb-3 text-center">
          <p className="text-sm font-bold">{t.modal.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t.modal.scenario(today)}
          </p>
        </div>
        <div className="flex flex-col py-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b py-1.5 text-xs last:border-0">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-semibold">{v}</span>
            </div>
          ))}
        </div>
        {review.feedbackPoints && review.feedbackPoints.length > 0 && (
          <div className="rounded-lg bg-muted px-3 py-2 text-xs leading-6">
            <p className="font-semibold">{t.modal.residentPoints}</p>
            {review.feedbackPoints.slice(0, 3).map((f, i) => (
              <p key={i}>
                {num(i + 1)}. {f}
              </p>
            ))}
          </div>
        )}
        <p className="mt-2 text-center text-[10px] leading-4 text-muted-foreground">
          {t.modal.disclaimer}
        </p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.print()}>
            {t.modal.print}
          </Button>
          <Button size="sm" className="flex-1" onClick={onClose}>
            {t.modal.close}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const { t, num, pct } = useI18n();
  const none = (n: number) => n === 0;
  const errs: { key: "critical" | "major" | "minor"; n: number; tone: "emerald" | "amber" | "rose"; sub: string }[] = [
    {
      key: "critical",
      n: review.criticalErrors,
      tone: none(review.criticalErrors) ? "emerald" : "rose",
      sub: none(review.criticalErrors) ? t.review.subs.criticalNone : t.review.subs.criticalSome,
    },
    {
      key: "major",
      n: review.majorErrors,
      tone: none(review.majorErrors) ? "emerald" : "amber",
      sub: none(review.majorErrors) ? t.review.subs.majorNone : t.review.subs.majorSome,
    },
    {
      key: "minor",
      n: review.minorErrors,
      tone: none(review.minorErrors) ? "emerald" : "amber",
      sub: review.minorNote?.trim() ? review.minorNote.trim() : none(review.minorErrors) ? t.review.subs.minorNone : t.review.subs.minorSome,
    },
  ];
  const toneCls = {
    emerald:
      "border bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800",
    amber:
      "border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    rose:
      "border border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30",
  } as const;
  const toneText = {
    emerald: "text-emerald-700 dark:text-emerald-300",
    amber: "text-amber-700 dark:text-amber-300",
    rose: "text-rose-700 dark:text-rose-300",
  } as const;
  return (
    <Card size="sm" className="w-full shrink-0 motion-safe:animate-in motion-safe:fade-in border-primary/20 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{t.review.title}</CardTitle>
        <CardDescription className="text-xs leading-5">
          {t.review.legend}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3">
          <div className="rounded-lg bg-primary px-4 py-3.5 text-center text-sm font-bold tracking-wide text-primary-foreground">
            {t.review.scoreLine(num(review.score))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {errs.map((e) => (
              <div key={e.key} className={cn("flex flex-col gap-1 rounded-lg px-2 py-2.5", toneCls[e.tone])}>
                <span className={cn("text-[10px] font-bold tracking-wide", toneText[e.tone])}>{t.review.errs[e.key].label}</span>
                <span className="text-[10px] text-muted-foreground">{t.review.errs[e.key].alt}</span>
                <span className={cn("text-lg font-bold leading-none", toneText[e.tone])}>
                  {num(e.n)}
                </span>
                <span className="text-[10px] leading-4 text-muted-foreground">{e.sub}</span>
              </div>
            ))}
          </div>
          <p className="rounded-md bg-muted px-3 py-2 text-center text-xs leading-5 text-muted-foreground">
            {t.review.verdict(review.score)}
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            {review.domains.map((d) => (
              <ScoreBar key={d.label} label={d.label} value={d.value} />
            ))}
          </div>
          {review.crs && (
            <div className="flex flex-col gap-1.5 border-t pt-2">
              <p className="px-2 text-xs font-semibold">{t.review.crsTitle}</p>
              <ScoreBar label={t.review.crs.confidence} value={review.crs.confidence} />
              <ScoreBar label={t.review.crs.reactionSpeed} value={review.crs.reactionSpeed} />
              <ScoreBar label={t.review.crs.clinicalAccuracy} value={review.crs.clinicalAccuracy} />
              <ScoreBar label={t.review.crs.decisionStability} value={review.crs.decisionStability} />
            </div>
          )}
          {(review.stressScore != null ||
            review.diagnosticPerformance != null ||
            review.communicationScore != null) && (
            <div className="grid grid-cols-3 gap-2 border-t pt-2 text-center">
              <div className="rounded-lg bg-muted px-1 py-2">
                <p className="text-[10px] text-muted-foreground">{t.review.stress}</p>
                <p className="text-sm font-bold">
                  {review.stressScore != null ? `${pct(review.stressScore)}` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted px-1 py-2">
                <p className="text-[10px] text-muted-foreground">{t.review.diagnosis}</p>
                <p className="text-sm font-bold">
                  {review.diagnosticPerformance != null ? `${pct(review.diagnosticPerformance)}` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted px-1 py-2">
                <p className="text-[10px] text-muted-foreground">{t.review.communication}</p>
                <p className="text-sm font-bold">
                  {review.communicationScore != null ? `${pct(review.communicationScore)}` : "—"}
                </p>
              </div>
            </div>
          )}
          {review.resilience && (
            <div className="flex flex-col gap-1 rounded-lg bg-muted px-3 py-2 text-xs leading-6">
              <p>✓ {review.resilience.didWell}</p>
              <p>⚠ {review.resilience.vulnerability}</p>
              <p>↻ {review.resilience.recovery}</p>
              <p>➜ {review.resilience.nextChallenge}</p>
            </div>
          )}
          {review.feedbackPoints && review.feedbackPoints.length > 0 && (
            <div className="flex flex-col gap-1 border-t px-2 pt-2 text-xs leading-6">
              <p className="font-semibold">{t.review.threePoints}</p>
              {review.feedbackPoints.slice(0, 3).map((f, i) => (
                <p key={i}>
                  {num(i + 1)}. {f}
                </p>
              ))}
            </div>
          )}
          <ReportButton review={review} />
        </div>
      </CardContent>
    </Card>
  );
}

function ThreadMessage({ msg, c }: { msg: Message; c: CaseBundle }) {
  const { t, num } = useI18n();
  if (msg.kind === "review" && msg.review) {
    return <ReviewCard review={msg.review} />;
  }
  const heroes = heroByKey(t);
  if (msg.hero && heroes[msg.hero]) {
    const h = heroes[msg.hero];
    return (
      <SceneHero src={h.src} alt={h.alt} caption={h.caption} title={h.title} />
    );
  }
  if (msg.card === "o2" || msg.card === "abx" || msg.card === "icu") {
    return (
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm leading-7 text-emerald-900 duration-200 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
        ✅ {msg.text}
      </div>
    );
  }
  if (msg.card === "ecg" || msg.card === "cxr") {
    const media = c.mediaById.get(msg.card);
    if (media) {
      return (
        <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 overflow-hidden rounded-xl border bg-card duration-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.src}
            alt={media.alt}
            className="h-auto w-full object-contain"
            loading="lazy"
          />
          <div className="px-3 py-1.5 text-xs text-muted-foreground">
            {msg.text}
          </div>
        </div>
      );
    }
  }
  if (msg.card === "labs") {
    return (
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 w-full shrink-0 rounded-xl border bg-card px-4 py-2.5 duration-200">
        <p className="pb-1 text-xs font-semibold">🧪 {t.chart.labsTitle}</p>
        <div className="flex flex-col">
          {[...c.labs, ...c.abg].map((item, i) => (
            <div key={item.label}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  dir="ltr"
                  className={
                    item.abnormal
                      ? "font-semibold text-destructive"
                      : "font-medium"
                  }
                >
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (msg.card === "vitalsAdmit") {
    return (
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 w-full shrink-0 rounded-xl border bg-card px-4 py-2.5 duration-200">
        <p className="pb-1 text-xs font-semibold">{t.vitals.cardTitle}</p>
        <div className="flex flex-col">
          {vitalRows(t, num, c.vitals).map((row, i) => (
            <div key={row.label}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between py-1 text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="flex items-center gap-1.5">
                  <span
                    dir="ltr"
                    className={
                      row.critical
                        ? "font-semibold text-destructive"
                        : "font-medium"
                    }
                  >
                    {row.num}
                  </span>
                  {row.unit && (
                    <span className="text-[10px] text-muted-foreground">
                      {row.unit}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (msg.card === "vitalsMid") {
    return (
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm leading-7 text-amber-900 duration-200 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
        📟 {msg.text}
      </div>
    );
  }

  if (msg.role === "student") {
    return (
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 max-w-[85%] self-start rounded-2xl rounded-se-sm bg-primary px-4 py-2.5 text-sm leading-7 text-primary-foreground duration-200">
        {msg.kind === "action" ? (
          <span className="opacity-90">📋 {msg.text}</span>
        ) : (
          msg.text
        )}
      </div>
    );
  }
  if (
    msg.role === "nurse" ||
    msg.role === "patient" ||
    msg.role === "resident"
  ) {
    return (
      <div
        className={cn(
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 flex max-w-[85%] flex-col gap-1 duration-200",
          ROLE_ALIGN[msg.role],
        )}
      >
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <span>
            {c.rolesByRole.get(msg.role as ChatRole)?.label ?? msg.role}
          </span>
          {msg.role === "resident" && (
            <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
              {t.roles.feedbackChip}
            </span>
          )}
        </div>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-7",
            ROLE_BUBBLE[msg.role],
          )}
        >
          {msg.text}
        </div>
      </div>
    );
  }
  return null;
}

function PatientChart({
  docIds,
  labsVisible,
  c,
}: {
  docIds: Set<string>;
  labsVisible: boolean;
  c: CaseBundle;
}) {
  const { t, num } = useI18n();
  const factsMap = factsById(c);
  return (
    <>
      <Card size="sm">
        <CardHeader>
          <CardTitle>{c.patient.name}</CardTitle>
          <CardDescription>
            {t.chart.patientDesc(c.patient.sex, num(c.patient.age), c.patient.job)}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {t.chart.patientMeta(
            c.patient.maritalStatus,
            num(c.patient.children),
            c.patient.residence,
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t.chart.vitalsTitle}</CardTitle>
          <CardDescription>{t.chart.vitalsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {vitalRows(t, num, c.vitals).map((row, i) => (
              <div key={row.label}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="flex items-center gap-1.5">
                    <span
                      dir="ltr"
                      className={
                        row.critical
                          ? "font-semibold text-destructive"
                          : "font-medium"
                      }
                    >
                      {row.num}
                    </span>
                    {row.unit && (
                      <span className="text-xs text-muted-foreground">
                        {row.unit}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {labsVisible ? (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{t.chart.labsTitle}</CardTitle>
          <CardDescription>{t.chart.labsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {c.labs.map((item: LabItem, i) => (
              <div key={item.label}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span
                    dir="ltr"
                    className={
                      item.abnormal
                        ? "font-semibold text-destructive"
                        : "font-medium"
                    }
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
            <Separator />
            <p className="pt-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
              ABG
            </p>
            {c.abg.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-1.5 text-sm"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  dir="ltr"
                  className={
                    item.abnormal
                      ? "font-semibold text-destructive"
                      : "font-medium"
                  }
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      ) : null}

      <Card size="sm">
        <CardHeader>
          <CardTitle>{t.chart.docsTitle}</CardTitle>
          <CardDescription>
            {t.chart.docsDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {docIds.size === 0 ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {t.chart.docsEmpty}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {DOC_GROUP_IDS.map((group) => {
                const hits = group.ids.filter((id) => docIds.has(id));
                if (hits.length === 0) return null;
                return (
                  <div key={group.key}>
                    <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted-foreground">
                      {t.docGroups[group.key]}
                    </p>
                    <ul className="flex flex-col gap-1">
                      {hits.map((id) => (
                        <li
                          key={id}
                          className="flex items-start gap-1.5 text-sm leading-6"
                        >
                          <span
                            aria-hidden
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70"
                          />
                          <span>{factsMap.get(id)?.answer ?? ""}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function ExamView({
  revealed,
  onReveal,
  c,
}: {
  revealed: ReadonlySet<string>;
  onReveal: (id: string) => void;
  c: CaseBundle;
}) {
  const { t, num } = useI18n();
  const examMap = examById(c);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm leading-6 text-muted-foreground">
          {t.exam.hint}
        </p>
        <Badge variant="secondary" className="shrink-0">
          {t.exam.progress(num(revealed.size), num(c.examFindings.length))}
        </Badge>
      </div>

      {EXAM_GROUP_IDS.map((group) => (
        <Card key={group.key} size="sm">
          <CardHeader>
            <CardTitle>{t.examGroups[group.key]}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {group.ids.map((id, i) => {
              const item = examMap.get(id);
              if (!item) return null;
              const done = revealed.has(id);
              return (
                <div key={id}>
                  {i > 0 && <Separator />}
                  {done ? (
                    <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 flex flex-col gap-0.5 py-2 duration-200">
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-sm leading-6">{item.finding}</span>
                      {item.mediaId && c.mediaById.get(item.mediaId) && (
                        <span className="mt-1.5 overflow-hidden rounded-xl border bg-card">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.mediaById.get(item.mediaId)!.src}
                            alt={c.mediaById.get(item.mediaId)!.alt}
                            className="h-auto w-full object-contain"
                            loading="lazy"
                          />
                          <span className="block px-3 py-1.5 text-xs text-muted-foreground">
                            {c.mediaById.get(item.mediaId)!.label}
                          </span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onReveal(id)}
                      className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-md py-2 text-sm transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>{item.label}</span>
                      <Stethoscope className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card size="sm" className="border-dashed opacity-70">
        <CardHeader>
          <CardTitle>{t.exam.undefinedTitle}</CardTitle>
          <CardDescription>
            {t.exam.undefinedDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          {t.examUndefined.map((label) => (
            <div
              key={label}
              className="flex min-h-9 items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm text-muted-foreground italic"
            >
              <span>{label}</span>
              <Badge variant="secondary">{t.exam.undefinedBadge}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const { t, locale, num } = useI18n();
  const c = caseFor(locale);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [chartOpen, setChartOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [typing, setTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<"interview" | "exam">("interview");
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  const [labsUnlocked, setLabsUnlocked] = useState(false);
  const [started, setStarted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const sessionRef = useRef<SessionState>(initialSessionState());
  const ordersRef = useRef<string[]>([]);
  const escalatedAtTurnRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [coveredIds, setCoveredIds] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const llmEnabled = useRef<boolean | null>(null);

  async function decide(input: string): Promise<void> {
    const fallback: Message = {
      role: "patient",
      text: t.chat.fallbackAck,
      kind: "ack",
    };
    if (llmEnabled.current === false) {
      setMessages((m) => [...m, fallback]);
      return;
    }
    try {
      if (llmEnabled.current === null) {
        const g = await fetch("/api/paraphrase");
        const j = (await g.json()) as { enabled?: boolean };
        llmEnabled.current = j.enabled === true;
        if (!llmEnabled.current) {
          setMessages((m) => [...m, fallback]);
          return;
        }
      }
      const history = messages
        .filter(
          (m) =>
            (m.role === "student" ||
              m.role === "patient" ||
              m.role === "nurse" ||
              m.role === "resident") &&
            m.text.trim().length > 0 &&
            !m.hero,
        )
        .slice(-10)
        .map((m) => ({
          role: m.role as "student" | "patient" | "nurse" | "resident",
          text: m.text,
        }));
      const res = await fetch("/api/paraphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          history,
          coveredIds: coveredIds,
          state: sessionRef.current,
          turnCount: messages.filter((m) => m.role === "student").length,
          o2Started: sessionRef.current.o2Started,
          escalated: sessionRef.current.escalated,
          turnsSinceEscalation: turnsSinceEscalation(
            escalatedAtTurnRef.current,
            messages.filter((m) => m.role === "student").length,
          ),
          locale,
        }),
        signal: AbortSignal.timeout(40_000),
      });
      if (!res.ok) {
        setMessages((m) => [...m, fallback]);
        return;
      }
      const j = (await res.json()) as {
        turn?: unknown;
        state?: unknown;
        coveredIds?: string[];
        hint?: string | null;
      };
      const turn = Array.isArray(j.turn)
        ? (j.turn as Message[]).filter(
            (m) =>
              m &&
              typeof m.text === "string" &&
              (m.role === "nurse" ||
                m.role === "patient" ||
                m.role === "resident" ||
                m.role === "system" ||
                m.role === "student"),
          )
        : [];
      if (turn.length === 0) {
        setMessages((m) => [...m, fallback]);
        return;
      }
      if (j.state && typeof j.state === "object") {
        const prevState = sessionRef.current;
        sessionRef.current = {
          ...initialSessionState(),
          ...(j.state as SessionState),
        };
        if (
          sessionRef.current.escalated &&
          !prevState.escalated &&
          escalatedAtTurnRef.current === null
        ) {
          escalatedAtTurnRef.current = messages.filter(
            (m) => m.role === "student",
          ).length;
        }
      }
      if (Array.isArray(j.coveredIds)) {
        setCoveredIds(j.coveredIds);
      }
      setHint(typeof j.hint === "string" && j.hint.trim() ? j.hint.trim() : null);
      for (const m of turn) {
        if (m.kind === "labs" || m.card === "labs") setLabsUnlocked(true);
        if (m.card && !ordersRef.current.includes(m.card)) {
          ordersRef.current = [...ordersRef.current, m.card];
        }
      }
      setMessages((m) => [...m, ...turn]);
      if (sessionRef.current.icuOrdered && !reviewing) {
        setReviewing(true);
        void runReview();
      }
    } catch {
      setMessages((m) => [...m, fallback]);
    }
  }

  async function runReview() {
    try {
      const transcript = messages
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n");
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          coveredIds: coveredIds,
          state: sessionRef.current,
          locale,
        }),
        signal: AbortSignal.timeout(40_000),
      });
      if (!res.ok) return;
      const j = (await res.json()) as {
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
        lesson?: string;
        domains?: { label: string; value: number }[];
        score?: number;
        criticalErrors?: number;
        majorErrors?: number;
        minorErrors?: number;
        minorNote?: string;
        crs?: { confidence?: unknown; reactionSpeed?: unknown; clinicalAccuracy?: unknown; decisionStability?: unknown } | null;
        stressScore?: unknown;
        stressNotes?: unknown;
        diagnosticPerformance?: unknown;
        diagnosticErrorRate?: unknown;
        importantErrors?: unknown;
        communicationScore?: unknown;
        resilience?: { didWell?: unknown; vulnerability?: unknown; recovery?: unknown; nextChallenge?: unknown } | null;
        feedbackPoints?: unknown;
      };
      const asList = (v: unknown): string[] =>
        Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && s.trim().length > 0) : [];
      const asNum = (v: unknown): number | null =>
        typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : null;
      const asStr = (v: unknown): string => (typeof v === "string" ? v.trim() : "");
      const review: Message[] = [
        {
          role: "resident",
          text: t.review.intro,
          kind: "interjection",
          hero: "resident",
          scene: SCENES.review,
        },
      ];
      if (j.feedback?.trim()) {
        review.push({
          role: "resident",
          text: j.feedback.trim(),
          kind: "interjection",
          scene: SCENES.review,
        });
      }
      for (const s of asList(j.strengths).slice(0, 3)) {
        review.push({
          role: "resident",
          text: `✓ ${s.trim()}`,
          kind: "interjection",
          scene: SCENES.review,
        });
      }
      for (const s of asList(j.improvements).slice(0, 3)) {
        review.push({
          role: "resident",
          text: `⚠ ${s.trim()}`,
          kind: "interjection",
          scene: SCENES.review,
        });
      }
      if (typeof j.lesson === "string" && j.lesson.trim()) {
        review.push({
          role: "resident",
          text: `${t.review.lessonPrefix}${j.lesson.trim()}`,
          kind: "interjection",
          scene: SCENES.review,
        });
      }
      if (typeof j.score === "number") {
        const crsRaw = j.crs;
        const crsVals =
          crsRaw && typeof crsRaw === "object"
            ? [asNum(crsRaw.confidence), asNum(crsRaw.reactionSpeed), asNum(crsRaw.clinicalAccuracy), asNum(crsRaw.decisionStability)]
            : null;
        const resRaw = j.resilience;
        review.push({
          role: "system",
          text: t.review.title,
          kind: "review",
          scene: SCENES.score,
          review: {
            domains: Array.isArray(j.domains)
              ? j.domains
                  .filter((d) => d && typeof d.label === "string" && typeof d.value === "number")
                  .slice(0, 5)
              : [],
            score: j.score,
            criticalErrors: typeof j.criticalErrors === "number" ? j.criticalErrors : 0,
            majorErrors: typeof j.majorErrors === "number" ? j.majorErrors : 0,
            minorErrors: typeof j.minorErrors === "number" ? j.minorErrors : 0,
            minorNote: typeof j.minorNote === "string" ? j.minorNote : undefined,
            crs: crsVals && crsVals.every((v): v is number => v !== null)
              ? {
                  confidence: crsVals[0],
                  reactionSpeed: crsVals[1],
                  clinicalAccuracy: crsVals[2],
                  decisionStability: crsVals[3],
                }
              : null,
            stressScore: asNum(j.stressScore),
            diagnosticPerformance: asNum(j.diagnosticPerformance),
            communicationScore: asNum(j.communicationScore),
            resilience:
              resRaw && typeof resRaw === "object" && asStr(resRaw.didWell)
                ? {
                    didWell: asStr(resRaw.didWell),
                    vulnerability: asStr(resRaw.vulnerability),
                    recovery: asStr(resRaw.recovery),
                    nextChallenge: asStr(resRaw.nextChallenge),
                  }
                : null,
            feedbackPoints: asList(j.feedbackPoints),
          },
        });
      }
      setMessages((m) => [...m, ...review]);
    } catch {
      /* review is a bonus: session stays usable without it */
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function pushReply(input: string) {
    setTyping(true);
    timerRef.current = setTimeout(
      () => {
        void (async () => {
          await decide(input);
          setTyping(false);
        })();
      },
      700 + Math.floor(Math.random() * 500),
    );
  }

  function send() {
    const text = draft.trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { role: "student", text }]);
    setDraft("");
    pushReply(text);
  }

  function start() {
    setStarted(true);
    const vitalsCard: Message = {
      role: "system",
      text: t.start.vitalsSummary({
        rr: num(c.vitals.rr),
        spo2: num(c.vitals.spo2),
        hr: num(c.vitals.hr),
        sys: num(c.vitals.bpSystolic),
        dia: num(c.vitals.bpDiastolic),
        temp: num(c.vitals.temperature),
      }),
      kind: "action",
      card: "vitalsAdmit",
    };
    setMessages([vitalsCard]);
    void (async () => {
      try {
        const res = await fetch("/api/paraphrase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intro: true, locale }),
          signal: AbortSignal.timeout(30_000),
        });
        if (!res.ok) throw new Error("intro failed");
        const j = (await res.json()) as {
          turn?: { role?: unknown; text?: unknown }[];
          hint?: string | null;
        };
        const first = Array.isArray(j.turn) ? j.turn[0] : undefined;
        const text =
          first && typeof first.text === "string" && first.text.trim()
            ? first.text.trim()
            : t.chat.clientIntro(c.patient.name, num(c.patient.age));
        setMessages((m) => [
          { role: "nurse", text: "", kind: "ack", hero: "nurse-triage", scene: SCENES.admit },
          { role: "nurse", text, kind: "ack" },
          ...m,
        ]);
        if (typeof j.hint === "string" && j.hint.trim()) setHint(j.hint.trim());
      } catch {
        setMessages((m) => [
          { role: "nurse", text: "", kind: "ack", hero: "nurse-triage", scene: SCENES.admit },
          { role: "nurse", text: t.chat.clientIntro(c.patient.name, num(c.patient.age)), kind: "ack" },
          ...m,
        ]);
      }
    })();
  }

  function restart() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([]);
    setCoveredIds([]);
    sessionRef.current = initialSessionState();
    ordersRef.current = [];
    escalatedAtTurnRef.current = null;
    setStarted(false);
    setReviewing(false);
    setDraft("");
    setActiveTab("interview");
    setRevealed(new Set());
    setLabsUnlocked(false);
    setHint(null);
  }

  function lastScene(_msg: Message, idx: number): string | undefined {
    for (let j = idx - 1; j >= 0; j -= 1) {
      const s = messages[j]?.scene;
      if (s) return s;
    }
    return undefined;
  }

  function revealFinding(id: string) {
    setRevealed((prev) => new Set(prev).add(id));
  }

  const documented = new Set(coveredIds);

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 border-b bg-card px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
        <Button
          variant="outline"
          size="lg"
          className="h-11 md:hidden"
          onClick={() => setChartOpen(true)}
        >
          <FileText data-icon="inline-start" />
          {t.app.chartButton}
        </Button>

        <div className="min-w-0">
          <h1 className="font-heading text-base leading-snug font-medium">
            {t.app.title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            {t.app.subtitle}
          </p>
        </div>

        <Badge variant="secondary" className="ms-auto max-sm:hidden">
          {t.app.erBadge}
        </Badge>

        <div className="flex items-center gap-1 max-sm:ms-auto md:ms-2">
          <LocaleSwitcher className="max-sm:hidden" />
          <Button
            variant="ghost"
            size="icon-lg"
            className="h-11 w-11 hidden md:inline-flex"
            aria-label={railOpen ? t.app.chartHideAria : t.app.chartShowAria}
            onClick={() => setRailOpen((v) => !v)}
          >
            {railOpen ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-lg"
            className="h-11 w-11"
            aria-label={t.app.restartAria}
            onClick={restart}
          >
            <RotateCcw />
          </Button>
        </div>
      </header>
      <InstallBanner />

      <main className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 gap-4 px-3 py-3 sm:px-4 sm:py-4">
        <aside
          className={cn(
            "w-72 shrink-0 flex-col gap-4 overflow-y-auto",
            railOpen ? "hidden md:flex" : "hidden",
          )}
        >
          <PatientChart docIds={documented} labsVisible={labsUnlocked} c={c} />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "interview" | "exam")}
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            <TabsList className="h-11! self-start p-0">
              <TabsTrigger value="interview" className="h-full px-4">
                <MessagesSquare data-icon="inline-start" />
                {t.tabs.interview}
              </TabsTrigger>
              <TabsTrigger value="exam" className="h-full px-4">
                <Stethoscope data-icon="inline-start" />
                {t.tabs.exam}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="interview"
              className="flex min-h-0 flex-col gap-3"
            >
          <div
            ref={scrollRef}
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pe-1"
          >
            {!started && messages.length === 0 && (
              <Card size="sm" className="shrink-0 border-dashed">
                <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
                  <p className="text-sm leading-7 text-muted-foreground">
                    {t.start.line1}
                    <br />
                    {t.start.line2}
                  </p>
                  <Button size="lg" className="h-12 text-base" onClick={start}>
                    <Play data-icon="inline-start" />
                    {t.start.button}
                  </Button>
                </CardContent>
              </Card>
            )}
            {messages.map((msg, i) => {
              const showDivider =
                !!msg.scene && msg.scene !== lastScene(msg, i);
              return (
                <div key={i} className="flex flex-col gap-3">
                  {showDivider && msg.scene && (
                    <SceneDivider
                      title={t.scene[msg.scene as SceneKey] ?? msg.scene}
                    />
                  )}
                  <ThreadMessage msg={msg} c={c} />
                </div>
              );
            })}

            {typing && (
              <div
                aria-label={t.chat.typingAria}
                className="typing-dots flex items-center gap-1.5 self-end rounded-2xl bg-muted px-4 py-3"
              >
                <span className="size-2 rounded-full bg-muted-foreground/70" />
                <span className="size-2 rounded-full bg-muted-foreground/70" />
                <span className="size-2 rounded-full bg-muted-foreground/70" />
              </div>
            )}
          </div>

          {showHint && hint && (
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 rounded-xl border bg-card px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <Lightbulb className="size-3.5 text-amber-600 dark:text-amber-400" />
                {t.chat.hintLabel}
                <button
                  type="button"
                  onClick={() => setShowHint(false)}
                  className="ms-auto text-[10px] font-normal text-muted-foreground hover:text-foreground"
                >
                  {t.chat.hintClose}
                </button>
              </p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">{hint}</p>
            </div>
          )}

          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`h-11 w-11 shrink-0 ${showHint ? "" : "text-muted-foreground"}`}
              aria-pressed={showHint}
              aria-label={t.chat.hintAria}
              onClick={() => setShowHint((v) => !v)}
            >
              <Lightbulb className="size-5" />
            </Button>
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={t.chat.placeholder}
              className="min-h-11 flex-1"
              rows={1}
            />
            <Button size="lg" className="h-11" onClick={send} disabled={!draft.trim() || typing}>
              {t.chat.send}
            </Button>
          </div>
            </TabsContent>

            <TabsContent value="exam" className="min-h-0 overflow-y-auto pe-1">
              <ExamView revealed={revealed} onReveal={revealFinding} c={c} />
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Sheet open={chartOpen} onOpenChange={setChartOpen}>
        <SheetContent
          side={locale === "fa" ? "right" : "left"}
          className="w-80 gap-4 overflow-y-auto p-4 sm:max-w-xs"
        >
          <SheetHeader>
            <SheetTitle>{t.sheet.title}</SheetTitle>
            <SheetDescription>{t.sheet.description}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 pb-2">
            <PatientChart docIds={documented} labsVisible={labsUnlocked} c={c} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
