export interface Fact {
  id: string;
  answer: string;
}

export interface Vitals {
  rr: number;
  spo2: number;
  hr: number;
  bpSystolic: number;
  bpDiastolic: number;
  temperature: number;
}

export interface ExamFinding {
  id: string;
  label: string;
  finding: string;
  mediaId?: string;
}

export type ChatRole = "student" | "patient" | "nurse" | "resident";

export interface RoleConfig {
  role: ChatRole;
  label: string;
  avatar?: string;
}

export interface LabItem {
  label: string;
  value: string;
  abnormal?: boolean;
}

export interface CaseMedia {
  id: string;
  src: string;
  alt: string;
  label: string;
}

export interface Directives {
  oxygen_started?: boolean;
  labs_requested?: boolean;
  ecg_done?: boolean;
  cxr_done?: boolean;
  dx_ordered?: boolean;
  icu_ordered?: boolean;
  facts_covered?: string[];
}
