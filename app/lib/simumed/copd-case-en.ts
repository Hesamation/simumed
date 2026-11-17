import type { CaseMedia, ExamFinding, Fact, LabItem, RoleConfig } from "./types";

/**
 * English rendering of the COPD-exacerbation teaching case. Fact IDs are
 * stable across locales (they key the documentation panel and the LLM
 * directive contract); the Persian source of truth is `copd-case.ts`.
 * Patient speech is written as a real dyspneic 68-year-old talks — short,
 * plain, non-technical.
 */

export const patientEn = {
  name: "Mr. Alireza Ahmadi",
  age: 68,
  sex: "Male",
  maritalStatus: "Married",
  children: 3,
  residence: "a housing complex on the outskirts of Tehran",
  job: "retired construction welder",
};

export const chiefComplaintEn =
  "I've been feeling off for three days, Doctor… but for the past two or three hours I honestly can't breathe.";

export const factsEn: Fact[] = [
  { id: "age-sex-job", answer: "I'm sixty-eight. I used to be a construction welder." },
  { id: "family-status", answer: "I'm married — since I was twenty-five. We have three kids." },
  { id: "residence", answer: "In a housing complex on the outskirts of Tehran." },
  { id: "chief-dyspnea", answer: "I've been feeling off for three days… but for the past two or three hours I honestly can't breathe." },
  { id: "dyspnea-history", answer: "Heavy exertion always left me short of breath, but it was never this bad." },
  { id: "sentence-limit", answer: "No… I can't get a full sentence out. I have to stop halfway through to catch my breath." },
  { id: "cough", answer: "Yes, I've been coughing a lot for three days." },
  { id: "sputum-change", answer: "My sputum is purulent — yellow." },
  { id: "hemoptysis", answer: "No, there's no blood in it." },
  { id: "wheeze", answer: "Yes, my chest is wheezing." },
  { id: "fever-feeling", answer: "Yes, I've got a fever." },
  { id: "night-sweats", answer: "I've been sweating at night these past few nights — it goes with this illness." },
  { id: "night-waking", answer: "Yes, the cough has been waking me from sleep for several nights." },
  { id: "uri-symptoms", answer: "My nose was running — like I'd caught a cold. My voice has gone a bit hoarse and deeper too." },
  { id: "pleuritic-pain", answer: "Since yesterday there's a sharp pain on the right side of my chest; it's worse when I cough or breathe deeply, and eases when I rest." },
  { id: "pain-cardiac-denial", answer: "No — it doesn't go to my arm or my neck." },
  { id: "coworker-contact", answer: "I still drop by work now and then — a few of my friends there have been coughing." },
  { id: "welding-exposure", answer: "Well, all my working life was construction and welding; the air there was always full of fumes and particles." },
  { id: "dust-denial", answer: "No, I haven't had any other notable dust exposure." },
  { id: "stress", answer: "Everybody's stressed these days — I worry about my kids' future. But this breathlessness I have right now, that's something else." },
  { id: "copd-history", answer: "They diagnosed COPD two years ago." },
  { id: "htn-history", answer: "Yes, my blood pressure went up five years ago and I've had it managed since." },
  { id: "home-o2-denial", answer: "No, I've never been on home oxygen." },
  { id: "no-prior-severe", answer: "No, this is the first time." },
  { id: "med-copd", answer: "I take Symbicort." },
  { id: "med-htn", answer: "My blood-pressure pill is Valzomix." },
  { id: "adherence", answer: "Yes, I stick to my medication well; I rarely forget a dose." },
  { id: "allergy-penicillin", answer: "When I was a kid, I remember getting penicillin once and it made me really ill." },
  { id: "allergy-nature", answer: "Honestly, I can't remember exactly what happened — I just felt very unwell." },
  { id: "surgery-denial", answer: "No, I've never had an operation." },
  { id: "family-father", answer: "My father died at an older age from a heart problem; I don't know the details." },
  { id: "family-mother", answer: "My mother had heart trouble too, but I don't know exactly what it was. She passed away at eighty-nine." },
  { id: "smoking-amount", answer: "Yes — a pack a day." },
  { id: "smoking-duration", answer: "Since I was young — about fifty years now." },
  { id: "alcohol-denial", answer: "No, I don't drink alcohol." },
  { id: "drugs-denial", answer: "No, never." },
  { id: "pets-birds", answer: "Yes, we keep two pairs of budgies at home." },
  { id: "baseline-function", answer: "I could manage my own day-to-day activities, but because of the breathing I cut work down and retired." },
  { id: "orthopnea-denial", answer: "No, I don't need to sleep sitting up." },
  { id: "pnd-denial", answer: "No, nothing like that." },
  { id: "weight-loss-denial", answer: "No, I haven't lost any weight." },
];

export const examFindingsEn: ExamFinding[] = [
  { id: "general", label: "General appearance", finding: "Ill-appearing, obvious respiratory distress, use of accessory muscles, speech broken into fragments" },
  { id: "skin-cyanosis", label: "Skin and cyanosis", finding: "Mild peripheral cyanosis around the lips; skin warm, mildly diaphoretic" },
  { id: "jvp", label: "JVP", finding: "Normal — no jugular venous distension" },
  { id: "trachea", label: "Trachea", finding: "Midline, not deviated" },
  { id: "chest-expansion", label: "Chest expansion", finding: "Reduced chest wall movement at the right base" },
  { id: "percussion", label: "Percussion", finding: "Dullness over the right lung base" },
  { id: "auscultation", label: "Auscultation", finding: "Coarse crackles and diminished breath sounds in the right lower lobe, mild bronchial breathing", mediaId: "cxr" },
  { id: "cardiac-exam", label: "Cardiac examination", finding: "Tachycardia, regular rhythm, no murmur", mediaId: "ecg" },
  { id: "abdomen", label: "Abdomen", finding: "Soft, non-tender, no organomegaly" },
];

export const labsEn: LabItem[] = [
  { label: "WBC", value: "17,800", abnormal: true },
  { label: "Neut", value: "89%", abnormal: true },
  { label: "Hb", value: "12.8" },
  { label: "Plt", value: "210,000" },
  { label: "Cr", value: "1.4", abnormal: true },
  { label: "Na", value: "134" },
  { label: "K", value: "4.2" },
  { label: "Lactate", value: "3.1", abnormal: true },
];

export const abgEn: LabItem[] = [
  { label: "pH", value: "7.31", abnormal: true },
  { label: "PaCO₂", value: "55", abnormal: true },
  { label: "PaO₂", value: "58", abnormal: true },
];

export const caseMediaEn: CaseMedia[] = [
  { id: "ecg", src: "/case/heartbeats.jpg", alt: "The patient's ECG tracing", label: "ECG" },
  { id: "cxr", src: "/case/lung-scan.jpg", alt: "The patient's chest X-ray", label: "Chest X-ray" },
  { id: "nurse", src: "/case/moods/nurse_stressed.jpg", alt: "Emergency department triage nurse", label: "Nurse" },
  { id: "patient", src: "/case/moods/patient.jpg", alt: "Patient giving his history", label: "Patient" },
  { id: "patient-o2", src: "/case/moods/patient_o2.jpg", alt: "Patient on oxygen", label: "Patient" },
  { id: "nurse-labs", src: "/case/moods/nurse_wtf.jpg", alt: "Nurse with the lab results", label: "Nurse" },
  { id: "resident", src: "/case/moods/resident_chill.jpg", alt: "Senior resident", label: "Senior resident" },
];

export const rolesEn: RoleConfig[] = [
  { role: "student", label: "Student" },
  { role: "patient", label: patientEn.name, avatar: "/case/moods/patient.jpg" },
  { role: "nurse", label: "Nurse", avatar: "/case/moods/nurse_stressed.jpg" },
  { role: "resident", label: "Senior resident", avatar: "/case/moods/resident_chill.jpg" },
];
