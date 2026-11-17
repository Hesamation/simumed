import type { CaseMedia, ExamFinding, Fact, LabItem, RoleConfig, Vitals } from "./types";

export const patient = {
  name: "آقای علیرضا احمدی",
  age: 68,
  sex: "مرد",
  maritalStatus: "متأهل",
  children: 3,
  residence: "شهرکی مسکونی اطراف تهران",
  job: "جوشکار ساختمانی (بازنشسته)",
};

export const chiefComplaint =
  "سه روزه حالم خوب نیست دکتر… ولی از دو سه ساعت پیش دیگه واقعاً نمی‌تونم نفس بکشم.";

export const facts: Fact[] = [
  { id: "age-sex-job", answer: "شصت و هشت سالمه. جوشکار ساختمانی بودم." },
  { id: "family-status", answer: "متأهلم، از ۲۵ سالگی. سه تا بچه دارم." },
  { id: "residence", answer: "تو یه شهرک مسکونی اطراف تهران." },
  { id: "chief-dyspnea", answer: "سه روزه حالم خوب نیست… ولی از دو سه ساعت پیش دیگه واقعاً نمی‌تونم نفس بکشم." },
  { id: "dyspnea-history", answer: "با فعالیت سنگین از قبل هم نفسم تنگ می‌شد، ولی انقدر شدید هیچ‌وقت نشده بود." },
  { id: "sentence-limit", answer: "نه… جمله‌های بلند نمی‌تونم بگم. وسط حرفم باید وایسم نفس بکشم." },
  { id: "cough", answer: "آره، سه روزه خیلی سرفه می‌کنم." },
  { id: "sputum-change", answer: "خلطم چرکی و زرده." },
  { id: "hemoptysis", answer: "نه، خون ندارم توی خلطم." },
  { id: "wheeze", answer: "آره، سینه‌ام خس‌خس می‌کنه." },
  { id: "fever-feeling", answer: "آره، تب دارم." },
  { id: "night-sweats", answer: "چند شب اخیر عرق کردم، با همین دورهٔ مریضیمه." },
  { id: "night-waking", answer: "آره، چند شبه از سرفه از خواب می‌پرم." },
  { id: "uri-symptoms", answer: "آبریزش بینی داشتم، انگار یه سرماخوردگی گرفته‌ام. صداهم کمی گرفته و بم شده." },
  { id: "pleuritic-pain", answer: "از دیروز سمت راست سینه‌ام یه درد تیزه؛ با سرفه و نفس عمیق بیشتر می‌شه، وقتی استراحت می‌کنم کمتره." },
  { id: "pain-cardiac-denial", answer: "نه، نه به دست می‌ره نه گردن." },
  { id: "coworker-contact", answer: "توی محل کارم که بعضی وقتا می‌رم، چند تا از دوستام سرفه داشتن." },
  { id: "welding-exposure", answer: "خب، عمهٔ عمرم تو ساختمون و جوشکاری بود؛ هوای اونجا همیشه پر از دود و ذرات بود." },
  { id: "dust-denial", answer: "نه، مواجهه مشخصی با گرد و خاک نداشتم." },
  { id: "stress", answer: "توی این دوره زمونه همه استرس دارن و نگران آینده بچه‌هام هستم. ولی این نفسم رو که الان گرفته، یه چیز دیگه‌ست." },
  { id: "copd-history", answer: "دو سال پیش COPD تشخیص دادن." },
  { id: "htn-history", answer: "آره، پنج سال پیش فشارم بالا رفت و از اون وقت کنترل می‌کنم." },
  { id: "home-o2-denial", answer: "نه، تا حالا اکسیژن خانگی نداشتم." },
  { id: "no-prior-severe", answer: "نه، این اولین باره." },
  { id: "med-copd", answer: "سیمبیکورت مصرف می‌کنم." },
  { id: "med-htn", answer: "داروی فشارم والزومیکسه." },
  { id: "adherence", answer: "آره، پایبندی‌م خوبه؛ فراموشی ندارم معمولاً." },
  { id: "allergy-penicillin", answer: "بچه که بودم، یه بار یادمه پنی‌سیلین زدم و حالم رو بهم ریخت." },
  { id: "allergy-nature", answer: "راستش یادم نمیاد دقیقاً چی شد؛ فقط حالم بد شد." },
  { id: "surgery-denial", answer: "نه، تا حالا عمل نکردم." },
  { id: "family-father", answer: "پدرم تو سن‌های بالا به خاطر مشکل قلبی فوت کرد؛ جزئیاتش رو نمی‌دونم." },
  { id: "family-mother", answer: "مادرم هم قلبش مشکل داشت، ولی دقیق نمی‌دونم چی بود. تو ۸۹ سالگی فوت کرد." },
  { id: "smoking-amount", answer: "آره، روزی یه پاکت." },
  { id: "smoking-duration", answer: "از جوونی؛ حدود پنجاه ساله." },
  { id: "alcohol-denial", answer: "نه، الکل نمی‌خورم." },
  { id: "drugs-denial", answer: "نه، سابقه ندارم اصلاً." },
  { id: "pets-birds", answer: "آره، دو جفت مرغ عشق داریم تو خونه." },
  { id: "baseline-function", answer: "کارهای شخصی خودم رو می‌کردم، ولی واسه همین کمتر کار کردم و بازنشسته شدم." },
  { id: "orthopnea-denial", answer: "نه، نیاز نیست نشسته بخوابم." },
  { id: "pnd-denial", answer: "نه، همچین چیزی ندارم." },
  { id: "weight-loss-denial", answer: "نه، وزنم کم نشده." },
];

export const vitals: Vitals = {
  rr: 32,
  spo2: 86,
  hr: 118,
  bpSystolic: 95,
  bpDiastolic: 60,
  temperature: 38.4,
};

export const examFindings: ExamFinding[] = [
  { id: "general", label: "وضعیت عمومی", finding: "ill-appearing، دیسترس تنفسی واضح، استفاده از عضلات فرعی، تکلم منقطع" },
  { id: "skin-cyanosis", label: "پوست و سیانوز", finding: "سیانوز محیطی خفیف اطراف لب‌ها، پوست گرم و تعریق خفیف" },
  { id: "jvp", label: "JVP", finding: "نرمال — اتساع وریدهای گردن ندارد" },
  { id: "trachea", label: "تراشه", finding: "در خط وسط، بدون انحراف" },
  { id: "chest-expansion", label: "Chest expansion", finding: "حرکت قفسه سینه در قاعده راست کاهش یافته" },
  { id: "percussion", label: "Percussion", finding: "دال بودن (dullness) در قاعده ریه راست" },
  { id: "auscultation", label: "Auscultation", finding: "کراکل درشت و کاهش صداهای تنفسی در لوب تحتانی راست، برونشیال بریسینگ خفیف", mediaId: "cxr" },
  { id: "cardiac-exam", label: "معاینه قلب", finding: "تاکی‌کارد، ریتم منظم، سوفل ندارد", mediaId: "ecg" },
  { id: "abdomen", label: "شکم", finding: "نرم، بدون تندرنس، ارگانومگالی ندارد" },
];

export const labs: LabItem[] = [
  { label: "WBC", value: "۱۷٬۸۰۰", abnormal: true },
  { label: "Neut", value: "۸۹٪", abnormal: true },
  { label: "Hb", value: "۱۲/۸" },
  { label: "Plt", value: "۲۱۰٬۰۰۰" },
  { label: "Cr", value: "۱/۴", abnormal: true },
  { label: "Na", value: "۱۳۴" },
  { label: "K", value: "۴/۲" },
  { label: "Lactate", value: "۳/۱", abnormal: true },
];

export const abg: LabItem[] = [
  { label: "pH", value: "۷/۳۱", abnormal: true },
  { label: "PaCO₂", value: "۵۵", abnormal: true },
  { label: "PaO₂", value: "۵۸", abnormal: true },
];

export const caseMedia: CaseMedia[] = [
  { id: "ecg", src: "/case/heartbeats.jpg", alt: "نوار قلب بیمار", label: "ECG" },
  { id: "cxr", src: "/case/lung-scan.jpg", alt: "گرافی قفسه سینه بیمار", label: "Chest X-ray" },
  { id: "nurse", src: "/case/moods/nurse_stressed.jpg", alt: "پرستار تریاژ اورژانس", label: "پرستار" },
  { id: "patient", src: "/case/moods/patient.jpg", alt: "بیمار در حال شرح حال", label: "بیمار" },
  { id: "patient-o2", src: "/case/moods/patient_o2.jpg", alt: "بیمار با اکسیژن", label: "بیمار" },
  { id: "nurse-labs", src: "/case/moods/nurse_wtf.jpg", alt: "پرستار با نتایج آزمایش", label: "پرستار" },
  { id: "resident", src: "/case/moods/resident_chill.jpg", alt: "رزیدنت ارشد", label: "رزیدنت ارشد" },
];

export const roles: RoleConfig[] = [
  { role: "student", label: "دانشجو" },
  { role: "patient", label: patient.name, avatar: "/case/moods/patient.jpg" },
  { role: "nurse", label: "پرستار", avatar: "/case/moods/nurse_stressed.jpg" },
  { role: "resident", label: "رزیدنت ارشد", avatar: "/case/moods/resident_chill.jpg" },
];
