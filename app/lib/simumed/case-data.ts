import type { Locale } from "@/lib/i18n/config";
import {
  abg,
  caseMedia,
  chiefComplaint,
  examFindings,
  facts,
  labs,
  patient,
  roles,
  vitals,
} from "./copd-case";
import {
  abgEn,
  caseMediaEn,
  chiefComplaintEn,
  examFindingsEn,
  factsEn,
  labsEn,
  patientEn,
  rolesEn,
} from "./copd-case-en";
import type {
  CaseMedia,
  ChatRole,
  ExamFinding,
  Fact,
  LabItem,
  RoleConfig,
  Vitals,
} from "./types";

export interface CasePatient {
  name: string;
  age: number;
  sex: string;
  maritalStatus: string;
  children: number;
  residence: string;
  job: string;
}

export interface CaseBundle {
  patient: CasePatient;
  chiefComplaint: string;
  facts: Fact[];
  vitals: Vitals;
  examFindings: ExamFinding[];
  labs: LabItem[];
  abg: LabItem[];
  media: CaseMedia[];
  mediaById: Map<string, CaseMedia>;
  roles: RoleConfig[];
  rolesByRole: Map<ChatRole, RoleConfig>;
}

function bundle(
  patient: CasePatient,
  chiefComplaint: string,
  facts: Fact[],
  examFindings: ExamFinding[],
  labs: LabItem[],
  abg: LabItem[],
  media: CaseMedia[],
  roles: RoleConfig[],
): CaseBundle {
  return {
    patient,
    chiefComplaint,
    facts,
    vitals,
    examFindings,
    labs,
    abg,
    media,
    mediaById: new Map(media.map((m) => [m.id, m])),
    roles,
    rolesByRole: new Map(roles.map((r) => [r.role, r])),
  };
}

const bundles: Record<Locale, CaseBundle> = {
  fa: bundle(
    patient,
    chiefComplaint,
    facts,
    examFindings,
    labs,
    abg,
    caseMedia,
    roles,
  ),
  en: bundle(
    patientEn,
    chiefComplaintEn,
    factsEn,
    examFindingsEn,
    labsEn,
    abgEn,
    caseMediaEn,
    rolesEn,
  ),
};

/** Locale-selected case content. The numeric vitals are shared by both
 *  locales; labels, speech and clinical text come from the selected bundle. */
export function caseFor(locale: Locale): CaseBundle {
  return bundles[locale];
}
