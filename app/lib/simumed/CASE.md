# CASE.md — SimuMed Pilot Scenario

> Single source of truth. All runtime behavior derives from this document. Code implements what's here; nothing is invented outside it.

---

## 1. Scenario

**Patient:** آقای علیرضا احمدی — 68, male, retired welder.
**Presentation:** Community-Acquired Pneumonia superimposed on COPD, with hypoxemic/hypercapnic respiratory failure.
**Setting:** Emergency department triage. Student interviews patient via chat. Nurse delivers vitals and investigations. Senior resident reviews performance at end.

---

## 2. Scenario Flow

Scene transitions are derived from LLM-declared directives (§7).

| Scene | Name | What happens |
|-------|------|--------------|
| 1 | ورود بیمار | Nurse opens with chief complaint + vitals card. Student begins questioning. |
| 2 | شرح حال سریع | Student asks history questions. Patient answers in-character. Student can order investigations. |
| 3 | درخواست Investigation | Student requests labs, ECG, CXR, antibiotics, admission. Nurse acknowledges and delivers results. |
| 4 | نتایج آزمایش | Labs and ABG auto-deliver once ECG + CXR are done (or on request). |
| 5 | تصمیم بالینی | Student decides treatment. Nurse reports deterioration if applicable. |
| 6 | مرور رزیدنت | Resident reviews session. Writes feedback, domain scores, final grade. Triggered when ICU ordered. |
| 7 | پایان | Score screen. |

---

## 3. Characters

### 3.1 پرستار (Nurse)
- Triage nurse. Professional, efficient, slightly stressed.
- Speaks to: Student.
- Functions: Opens with chief complaint + vitals. Acknowledges orders briefly ("چشم", "انجام شد"). Delivers investigation results, action cards, status updates. Can note deterioration.
- Voice: Formal medical Persian. Clinical shorthand OK. Concise. Never volunteers extra information.

### 3.2 بیمار (Patient — Ahmadi)
- 68-year-old retired welder with COPD + HTN. Current exacerbation: pneumonia.
- Speaks to: Student.
- Rules:
  - Answers only what is asked. Never volunteers unrelated history.
  - Conversational Tehrani register (نمی‌تونم، بپرسید). Not formal written Persian.
  - Short answers. Can't speak in long sentences (dyspnea). Breaks sentences to breathe.
  - Vague on details he wouldn't know (exact pack-years, allergy nature, medication doses).
  - Consistent — never contradicts earlier statements.
  - Does NOT know medical terminology. Says "نفسم بند اومده" not "dyspnea". Says "سینه‌ام خس‌خس می‌کنه" not "wheezing".
  - For out-of-scope topics: deflects naturally ("چیزی بهم نگفته" / "نمی‌دونم" / "یادم نیست").

### 3.3 رزیدنت ارشد (Senior Resident)
- Reviews student performance at end. Only appears in Scene 6+.
- Speaks to: Student.
- Voice: Senior, collegial but firm. Educational tone. Uses "دکتر" for the student.

### 3.4 دانشجو (Student)
- The human player. Types in Persian. Asks questions and gives orders.

---

## 4. Patient Knowledge

All patient answers below are the ONLY things the patient may say. The LLM must not fabricate, expand, or add information beyond these answers.

### 4.1 هویت و خانواده
- Age/job: شصت و هشت سالمه. جوشکار ساختمانی بودم.
- Family status: متأهلم، از ۲۵ سالگی. سه تا بچه دارم.
- Residence: تو یه شهرک مسکونی اطراف تهران.

### 4.2 شکایت اصلی و تنفس
- Chief complaint: سه روزه حالم خوب نیست… ولی از دو سه ساعت پیش دیگه واقعاً نمی‌تونم نفس بکشم.
- Dyspnea history: با فعالیت سنگین از قبل هم نفسم تنگ می‌شد، ولی انقدر شدید هیچ‌وقت نشده بود.
- Sentence limit: نه… جمله‌های بلند نمی‌تونم بگم. وسط حرفم باید وایسم نفس بکشم.

### 4.3 سرفه و خلط
- Cough: آره، سه روزه خیلی سرفه می‌کنم.
- Sputum: خلطم چرکی و زرده.
- Hemoptysis: نه، خون ندارم توی خلطم.
- Wheeze: آره، سینه‌ام خس‌خس می‌کنه.

### 4.4 تب و علائم عمومی
- Fever: آره، تب دارم.
- Night sweats: چند شب اخیر عرق کردم، با همین دورهٔ مریضیمه.
- Night waking: آره، چند شبه از سرفه از خواب می‌پرم.
- URI symptoms: آبریزش بینی داشتم، انگار یه سرماخوردگی گرفته‌ام. صداهم کمی گرفته و بم شده.

### 4.5 درد قفسه سینه
- Pleuritic pain: از دیروز سمت راست سینه‌ام یه درد تیزه؛ با سرفه و نفس عمیق بیشتر می‌شه، وقتی استراحت می‌کنم کمتره.
- Cardiac denial: نه، نه به دست می‌ره نه گردن.

### 4.6 مواجهه‌ها و عوامل خطر
- Coworker contact: توی محل کارم که بعضی وقتا می‌رم، چند تا از دوستام سرفه داشتن.
- Welding exposure: خب، عمهٔ عمرم تو ساختمون و جوشکاری بود؛ هوای اونجا همیشه پر از دود و ذرات بود.
- Dust denial: نه، مواجهه مشخصی با گرد و خاک نداشتم.
- Stress: توی این دوره زمونه همه استرس دارن و نگران آینده بچه‌هام هستم. ولی این نفسم رو که الان گرفته، یه چیز دیگه‌ست.

### 4.7 سابقه بیماری
- COPD history: دو سال پیش COPD تشخیص دادن.
- HTN: آره، پنج سال پیش فشارم بالا رفت و از اون وقت کنترل می‌کنم.
- Home O₂: نه، تا حالا اکسیژن خانگی نداشتم.
- Prior severity: نه، این اولین باره.

### 4.8 داروها
- COPD med: سیمبیکورت مصرف می‌کنم.
- HTN med: داروی فشارم والزومیکسه.
- Adherence: آره، پایبندی‌م خوبه؛ فراموشی ندارم معمولاً.

### 4.9 حساسیت
- Penicillin allergy: بچه که بودم، یه بار یادمه پنی‌سیلین زدم و حالم رو بهم ریخت.
- Allergy nature: راستش یادم نمیاد دقیقاً چی شد؛ فقط حالم بد شد.

### 4.10 جراحی و خانواده
- Surgery denial: نه، تا حالا عمل نکردم.
- Father: پدرم تو سن‌های بالا به خاطر مشکل قلبی فوت کرد؛ جزئیاتش رو نمی‌دونم.
- Mother: مادرم هم قلبش مشکل داشت، ولی دقیق نمی‌دونم چی بود. تو ۸۹ سالگی فوت کرد.

### 4.11 عادات زندگی
- Smoking amount: آره، روزی یه پاکت.
- Smoking duration: از جوونی؛ حدود پنجاه ساله.
- Alcohol: نه، الکل نمی‌خورم.
- Drugs: نه، سابقه ندارم اصلاً.

### 4.12 سایر
- Pets: آره، دو جفت مرغ عشق داریم تو خونه.
- Baseline function: کارهای شخصی خودم رو می‌کردم، ولی واسه همین کمتر کار کردم و بازنشسته شدم.
- Orthopnea denial: نه، نیاز نیست نشسته بخوابم.
- PND denial: نه، همچین چیزی ندارم.
- Weight loss denial: نه، وزنم کم نشده.

### 4.13 Out-of-scope topics

These have NO defined answer. Patient must deflect naturally:
- Vaccination status, sleep quality, diet, economic situation, travel history
- TB contact, prior admissions, NIV/intubation, exacerbation count
- Asthma, kidney/liver/diabetes, stroke, cancer
- Bird cage details, medication doses
- GI symptoms, GU symptoms, neurological symptoms, palpitations, syncope
- MSK, skin, hematologic, endocrine, chills, appetite, fatigue, leg swelling, weight gain, DVT/PE history

---

## 5. Clinical Data

### 5.1 Vitals
| Vital | Value |
|-------|-------|
| RR | 32/min |
| SpO₂ | 86% (without oxygen) |
| HR | 118/min |
| BP | 95/60 mmHg |
| Temp | 38.4°C |

### 5.2 Physical Examination
| Finding | Detail |
|---------|--------|
| General | ill-appearing, respiratory distress, accessory muscle use, broken speech |
| Skin | mild peripheral cyanosis around lips, warm skin, mild diaphoresis |
| JVP | normal |
| Trachea | midline |
| Chest expansion | reduced at right base |
| Percussion | dullness at right lung base |
| Auscultation | coarse crackles + decreased breath sounds RLL, mild bronchial breathing |
| Cardiac | tachycardia, regular, no murmur |
| Abdomen | soft, no tenderness, no organomegaly |

### 5.3 Labs
| Test | Value | Flag |
|------|-------|------|
| WBC | 17,800 /µL | HIGH |
| Neutrophil | 89% | HIGH |
| Hb | 12.8 g/dL | normal |
| Platelet | 210,000 /µL | normal |
| Cr | 1.4 mg/dL | HIGH |
| Na | 134 mEq/L | normal |
| K | 4.2 mEq/L | normal |
| Lactate | 3.1 mmol/L | HIGH |

### 5.4 ABG
| Test | Value | Flag |
|------|-------|------|
| pH | 7.31 | LOW |
| PaCO₂ | 55 mmHg | HIGH |
| PaO₂ | 58 mmHg | LOW |

### 5.5 Media
| ID | Source | Used for |
|----|--------|----------|
| ecg | /case/heartbeats.jpg | ECG card |
| cxr | /case/lung-sscan.jpg | CXR card |
| nurse | /case/moods/nurse_stressed.jpg | Nurse avatar (default) |
| nurse-labs | /case/moods/nurse_wtf.jpg | Nurse avatar (labs delivery) |
| patient | /case/moods/patient.jpg | Patient avatar (default) |
| patient-o2 | /case/moods/patient_o2.jpg | Patient avatar (after O₂) |
| resident | /case/moods/resident_chill.jpg | Resident avatar |

---

## 6. Investigation Flow

### Order acknowledgment
Nurse acknowledges briefly:
- Oxygen: "چشم." → action card "اکسیژن شروع شد"
- Labs: "چشم دکتر." → labs_requested = true
- ECG: "انجام شد." → ecg_done = true, show ECG image
- CXR: "الان می‌گیرن." → cxr_done = true, show CXR image
- Antibiotics/admission: "چشم دکتر." → dx_ordered = true
- ICU: "چشم دکتر." → icu_ordered = true

### Labs delivery
Labs auto-deliver once BOTH ecg_done AND cxr_done are true, OR on explicit student request. Nurse delivers:
1. Lab panel (WBC, Neut, Hb, Plt, Cr, Na, K, Lactate)
2. ABG (pH, PaCO₂, PaO₂)

### Deterioration
After dx_ordered, nurse can note: "دکتر، فشارش ۹۰ روی ۵۸ شده و هنوز تنگی نفس داره."

---

## 7. Directive Contract

LLM returns JSON:
```json
{
  "role": "patient" | "nurse" | "resident",
  "kind": "reply" | "interjection",
  "text": "spoken dialogue in Persian",
  "directives": {
    "oxygen_started": false,
    "labs_requested": false,
    "ecg_done": false,
    "cxr_done": false,
    "dx_ordered": false,
    "icu_ordered": false,
    "facts_covered": []
  }
}
```

| Directive | When true | Server action |
|-----------|-----------|---------------|
| oxygen_started | Student orders oxygen, or nurse announces it | Update patient avatar to patient_o2.jpg |
| labs_requested | Student asks for blood work | Track labs ordered |
| ecg_done | Nurse delivers ECG | Show ECG image card |
| cxr_done | Nurse delivers CXR | Show CXR image card |
| dx_ordered | Student orders antibiotics/admission | Trigger escalation path |
| icu_ordered | Student orders ICU transfer | Trigger resident review |
| facts_covered | Fact IDs successfully elicited from §4 | Drive hint bulb coverage |

---

## 8. Interjections

Two teaching beats. LLM carries these rules in its system prompt and declares `kind: "interjection"` when triggered.

### 8.1 Oxygen Neglect
- Trigger: 3+ student turns without ordering oxygen, and oxygen_started is still false.
- Resident text: "دکتر! SpO₂ هشتادوشیش درصده و هنوز اکسیژن شروع نکردی. اول اکسیژن، بعد شرح‌حال."
- Nurse follows: "اکسیژن براش بذارید." → action card: "اکسیژن شروع شد"

### 8.2 ICU Neglect
- Trigger: 2+ turns after escalation (dx_ordered=true) without ICU order.
- Resident text: "فشارش افتاده و هنوز دیسترس تنفسی داره. برای حمایت تنفسی و انتقال به ICU آماده‌باش بده."
- Nurse follows: "برای حمایت تنفسی و انتقال به ICU آماده‌ش کنید." → action card: "آماده‌باش حمایت تنفسی / ICU ثبت شد"

---

## 9. System Rules (LLM Prompt)

1. **Answer only what is asked.** One concept per reply. Do not volunteer extra information.
2. **Stay in character.** Patient uses conversational Tehrani register. Nurse uses formal medical Persian. Resident uses senior collegial tone.
3. **Patient does not know medical terms.** Says "نفسم بند اومده" not "dyspnea". Says "سینه‌ام خس‌خس می‌کنه" not "wheezing".
4. **Patient answers from §4 only.** Never fabricate. For out-of-scope topics (§4.13), deflect naturally.
5. **Nurse is efficient.** Acknowledges orders briefly. Delivers results factually. Does not explain or educate.
6. **Resident appears only in Scene 6+.** Reviews performance, writes feedback and score.
7. **Interjections:** When trigger conditions from §8 are met, model declares `kind: "interjection"` with appropriate resident text. Nurse follows up with the order/action.
8. **Consistency:** Never contradict earlier statements.
9. **No overexplaining.** Short, natural answers. Patient is dyspneic — can't give long speeches.
10. **Don't mention being an AI or a simulation.** Stay in character at all times.

---

## 10. Evaluation

A single LLM call after the session reviews the full transcript and produces:

1. **Resident feedback text** (a warm Persian opening line)
2. **Strengths** (2-3 short sentences, grounded in what the student actually did)
3. **Improvements** (2-3 short sentences, each pairing the miss with the correct action)
4. **Teaching pearl** (1-2 sentences from this case — e.g. oxygen first in COPD exacerbation, CO₂ retention risk)
5. **Domain scores** (0-100% bars):
   - History Taking
   - Clinical Reasoning
   - Investigation
   - Management
   - Communication
6. **Final score** (0-100)
7. **Error counts:** Critical, Major, Minor (+ one-line note for the minor error)
8. **CRS** (آمادگی بالینی): confidence, reactionSpeed, clinicalAccuracy, decisionStability — each 0-100 or null when data is insufficient
9. **Stress performance** 0-100 or null + observed stress notes (behavior only, never a clinical anxiety claim)
10. **Diagnostic performance** 0-100 (+ error rate / important errors when applicable)
11. **Communication score** 0-100
12. **Resilience**: didWell, vulnerability, recovery, nextChallenge (short Persian strings)
13. **Feedback points**: max 3 practical improvement notes

The UI renders the resident's speech turns in chat (feedback, strengths ✓, improvements ⚠, pearl 💡) followed by a کارنامه نهایی scorecard: score banner, three error counters, verdict line, domain bars.

Grounded in what the student actually did vs. what they could have done (based on case knowledge in this document). The resident is constructive but honest.
