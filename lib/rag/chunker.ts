import type { CertLevel } from "@/types/database.types";

export interface GuidelineChunk {
  content: string;
  source: string;
  certLevel: CertLevel | null;
  topicCategory: string | null;
  recommendationClass: string | null;
  evidenceLevel: string | null;
  keywords: string[];
  chunkIndex: number;
  totalChunksInSource: number;
}

const CHUNK_TARGET_TOKENS = 400;
const CHUNK_OVERLAP_TOKENS = 50;
const WORDS_PER_TOKEN = 0.75; // approximate

const TOPIC_RULES: Array<{ pattern: RegExp; topic: string }> = [
  { pattern: /cardiac arrest|ventricular fibrillation|pulseless|asystole|pea/i, topic: "cardiac_arrest" },
  { pattern: /cpr|compression|chest compression|defibrillat/i, topic: "cardiac_arrest" },
  { pattern: /chain of survival/i, topic: "cardiac_arrest" },
  { pattern: /airway|intubat|ventilat|bvm|opa|npa|lma|suproglottic/i, topic: "airway_management" },
  { pattern: /drug|medication|formulary|dose|dosage|administer/i, topic: "drug_formulary" },
  { pattern: /epinephrine|albuterol|nitroglycerin|naloxone|aspirin|oxygen/i, topic: "drug_formulary" },
  { pattern: /anaphylaxis|allergic reaction|anaphylactic/i, topic: "anaphylaxis" },
  { pattern: /shock|hypotension|hypoperfusion/i, topic: "shock" },
  { pattern: /trauma|hemorrhage|bleeding|tourniquet|fracture|spinal/i, topic: "trauma_critical" },
  { pattern: /stroke|tia|cerebrovascular/i, topic: "medical_emergency" },
  { pattern: /seizure|convulsion|epileps/i, topic: "medical_emergency" },
  { pattern: /diabetes|glucose|hypoglycemia|hyperglycemia/i, topic: "medical_emergency" },
  { pattern: /pediatric|child|infant|neonate/i, topic: "pediatric" },
  { pattern: /obstetric|pregnan|labor|delivery|childbirth/i, topic: "obstetric" },
  { pattern: /assess|primary survey|secondary survey|vital signs|sample|opqrst/i, topic: "patient_assessment" },
  { pattern: /aed|automated external defibrillat/i, topic: "cardiac_arrest" },
  { pattern: /fbao|foreign body|choking|heimlich/i, topic: "airway_management" },
  { pattern: /documentation|pcr|report|legal|ethics/i, topic: "legal_ethics" },
];

const EMS_KEYWORDS = [
  "CPR", "AED", "ROSC", "VF", "pVT", "PEA", "asystole", "BVM",
  "OPA", "NPA", "SpO2", "ETCO2", "BGL", "GCS", "MAP", "ECG",
  "EMT", "AEMT", "Paramedic", "BLS", "ALS", "NREMT",
  "epinephrine", "naloxone", "albuterol", "nitroglycerin", "aspirin",
  "anaphylaxis", "shock", "trauma", "stroke", "seizure",
  "cardiac arrest", "chain of survival", "defibrillation",
  "compression", "ventilation", "airway", "intubation",
  "hemorrhage", "tourniquet", "hypoglycemia", "hyperglycemia",
  "tachycardia", "bradycardia", "hypertension", "hypotension",
  "dyspnea", "diaphoresis", "syncope", "altered mental status",
  "SAMPLE", "OPQRST", "AVPU", "GCS", "JVD", "tracheal deviation",
  "Cushing's triad", "Beck's triad", "tension pneumothorax", "tamponade",
];

function inferTopicCategory(content: string): string | null {
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(content)) return rule.topic;
  }
  return null;
}

function inferCertLevel(content: string, source: string): CertLevel | null {
  const text = (content + " " + source).toLowerCase();
  if (text.includes("paramedic") || text.includes("als")) return "Paramedic";
  if (text.includes("aemt")) return "AEMT";
  if (text.includes("emt-b") || text.includes("emt basic") || text.includes("emt level")) return "EMT";
  if (text.includes("emr")) return "EMR";
  if (text.includes("bls") || text.includes("basic life support")) return null; // applies to all
  return "EMT"; // default
}

function extractKeywords(content: string): string[] {
  return EMS_KEYWORDS.filter((kw) =>
    content.toLowerCase().includes(kw.toLowerCase())
  );
}

function inferRecommendationClass(content: string): string | null {
  const match = content.match(/class\s+([0-9]+[ab]?|I{1,3}[ab]?)/i);
  return match ? match[1].toUpperCase() : null;
}

function inferEvidenceLevel(content: string): string | null {
  const match = content.match(/level\s+of\s+evidence\s*:?\s*([A-C])/i) ||
    content.match(/evidence\s+(?:level|class)\s*:?\s*([A-C])/i);
  return match ? match[1].toUpperCase() : null;
}

function splitIntoChunks(text: string): string[] {
  // Split on section boundaries first
  const sections = text.split(/\n(?=#{1,4}\s|[A-Z][A-Z\s]{10,}:|\d+\.\s)/);
  const chunks: string[] = [];
  const targetWords = Math.round(CHUNK_TARGET_TOKENS / WORDS_PER_TOKEN);
  const overlapWords = Math.round(CHUNK_OVERLAP_TOKENS / WORDS_PER_TOKEN);

  for (const section of sections) {
    const words = section.split(/\s+/).filter(Boolean);
    if (words.length <= targetWords) {
      if (words.length > 20) chunks.push(section.trim());
      continue;
    }

    // Sliding window
    let start = 0;
    while (start < words.length) {
      const end = Math.min(start + targetWords, words.length);
      chunks.push(words.slice(start, end).join(" "));
      if (end >= words.length) break;
      start = end - overlapWords;
    }
  }

  return chunks.filter((c) => c.length > 50);
}

export function chunkDocument(source: string, content: string): GuidelineChunk[] {
  const rawChunks = splitIntoChunks(content);
  const total = rawChunks.length;

  return rawChunks.map((chunkContent, index) => ({
    content: chunkContent,
    source,
    certLevel: inferCertLevel(chunkContent, source),
    topicCategory: inferTopicCategory(chunkContent),
    recommendationClass: inferRecommendationClass(chunkContent),
    evidenceLevel: inferEvidenceLevel(chunkContent),
    keywords: extractKeywords(chunkContent),
    chunkIndex: index,
    totalChunksInSource: total,
  }));
}

export const EMS_GUIDELINE_DOCUMENTS = [
  {
    source: "AHA_2025_BLS_CPR_Chain",
    content: `# AHA 2025 BLS Guidelines: CPR Parameters and Chain of Survival

## CPR Compression Parameters (Adult)
High-quality CPR is the cornerstone of resuscitation. For adult cardiac arrest patients:
- Compression rate: 100-120 compressions per minute
- Compression depth: 2 to 2.4 inches (5-6 cm)
- Allow complete chest recoil between compressions
- Minimize interruptions: pauses should not exceed 10 seconds
- Target chest compression fraction (CCF) ≥0.80
- Ratio: 30 compressions to 2 ventilations (30:2)

## CPR Compression Parameters (Child)
For pediatric cardiac arrest:
- Compression rate: 100-120 compressions per minute
- Compression depth: approximately 2 inches (5 cm), at least 1/3 AP diameter
- Single rescuer ratio: 30:2; Dual rescuer ratio: 15:2
- Allow full recoil between compressions

## CPR Compression Parameters (Infant)
For infant cardiac arrest (<1 year):
- Compression rate: 100-120 compressions per minute  
- Compression depth: approximately 1.5 inches (4 cm), at least 1/3 AP diameter
- **2025 UPDATE**: Two-finger technique is ELIMINATED. Two-thumb encircling technique is now recommended for all rescuers.
- Single rescuer ratio: 30:2; Dual rescuer ratio: 15:2

## Chain of Survival (2025 — Six Links)
The AHA 2025 guidelines formalize six links in the Chain of Survival:
1. Recognition and Activation — Early recognition and calling for help
2. High-Quality CPR — Immediate CPR with minimal interruptions
3. Defibrillation — Rapid shock for shockable rhythms (VF/pVT)
4. Advanced Resuscitation — ALS interventions
5. Post-Cardiac Arrest Care — Targeted temperature management, goal-directed therapy
6. Recovery and Survivorship — NEW 2025: long-term rehabilitation and support

## Shockable vs Non-Shockable Rhythms
Shockable: Ventricular Fibrillation (VF), Pulseless Ventricular Tachycardia (pVT)
Non-shockable: Pulseless Electrical Activity (PEA), Asystole

## CPR Quality Elements
1. Rate 100-120/min
2. Adequate depth (adult 2-2.4in, child ~2in, infant ~1.5in)
3. Full chest recoil
4. Minimize interruptions (CCF ≥0.80, pauses <10 sec)
5. Avoid excessive ventilation (1 breath per 6 seconds during continuous CPR)

## Post-ROSC Targets (AHA 2025)
After Return of Spontaneous Circulation:
- SpO2: 90-98% (avoid hyperoxia — do NOT target 100%)
- MAP: ≥65 mmHg (Note: MAP target, NOT systolic BP — per AHA 2025 Figure 7)
- PaCO2: 35-45 mmHg (normocapnia — avoid hypo/hypercapnia)
- Blood glucose: 70-180 mg/dL
- Temperature control: 32-37.5°C for 36 hours

## Head-Up CPR (AHA 2025 Class 3)
Head-up CPR is NOT recommended outside clinical trials (Class 3 Recommendation, AHA 2025).

## H's and T's — Reversible Causes
Five H's: Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypothermia
Five T's: Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (PE), Thrombosis (Coronary)
`,
  },
  {
    source: "AHA_2025_BLS_AED_FBAO",
    content: `# AHA 2025 BLS Guidelines: AED and FBAO Management

## AED Use — Step-by-Step Protocol
1. Power ON the AED (press button or open lid)
2. Expose chest; dry skin and remove medication patches. Class 2b (AHA 2025): For a bra, it may be reasonable to adjust or cut rather than remove, if removal causes delay.
3. Attach defibrillator pads: right infraclavicular + left lateral axilla (V4-V5 level)
4. Plug in cable; allow AED to analyze rhythm (ensure no one touching patient)
5. If shock advised: announce "Clear!", verify all clear, deliver shock
6. IMMEDIATELY resume CPR after shock (do NOT pause to check pulse)
7. Continue 2-minute CPR cycles, reanalyze every 2 minutes

## AED Bra Guidance (AHA 2025 — Equity Update)
Class of Recommendation 2b: For a patient wearing a bra, it may be reasonable to adjust or cut the bra rather than remove it entirely, provided this does not cause significant delay in defibrillation. This update addresses the disparity in which women receive lower rates of bystander AED use in public settings.

## AED Pad Placement
Standard: Right infraclavicular (below right clavicle, right of sternum) + Left lateral (left axillary area at nipple line)
Alternative posterior: Anterior left precordium + Posterior left infrascapular
Pacemaker: Place pad ≥1 inch away from implanted device
Medication patches: REMOVE before pad placement; wipe skin dry

## Pediatric AED (AHA 2025 Update)
AED is now recommended for infants <1 year when a manual defibrillator is not available. Pediatric-dose attenuated device preferred; standard AED acceptable if pediatric device unavailable.

## Foreign Body Airway Obstruction (FBAO) — Adult/Child
The AHA 2025 guidelines formalize the 5-and-5 algorithm:
1. Confirm complete obstruction (cannot speak, cough, or breathe effectively)
2. Activate EMS
3. Deliver 5 firm back blows between shoulder blades (heel of hand)
4. Deliver 5 abdominal thrusts (Heimlich): fist above navel, below xiphoid process; pull inward and upward
5. Alternate 5 back blows and 5 abdominal thrusts until obstruction cleared or patient loses consciousness
6. If patient loses consciousness: begin CPR; look for visible object with each airway opening

## FBAO — Infant (Critical Distinctions)
For infants <1 year:
- Use 5 BACK BLOWS + 5 CHEST THRUSTS (Note: AHA 2025 uses term "thrusts" intentionally, not "compressions")
- ABDOMINAL THRUSTS ARE CONTRAINDICATED in infants (risk of solid organ injury)
- Back blows: heel-of-1-hand technique, infant face-down over forearm
- Chest thrusts: two-finger technique on lower sternum, face-up

## FBAO Special Populations
- Obese or pregnant patients: use CHEST THRUSTS instead of abdominal thrusts
- Cannot effectively encircle abdomen; chest thrusts provide alternative force
`,
  },
  {
    source: "EMT_B_Medications_Airway_Assessment",
    content: `# EMT-B Scope: Medications, Airway, and Assessment

## Oxygen Therapy
Oxygen is a BLS-level medication. Key administration parameters:
- Non-rebreather mask (NRB): 10-15 LPM (delivers ~90% FiO2)
- Nasal cannula (NC): 1-6 LPM (delivers ~24-44% FiO2)
- BVM with O2 reservoir: 15 LPM
Critical: Carbon monoxide poisoning — ALWAYS use NRB 10-15 LPM regardless of SpO2. Pulse oximetry reads falsely normal in CO poisoning (COHb binds hemoglobin similar to O2).

## Aspirin (ASA) — 324 mg Chewed
Mechanism: COX-1 inhibitor; irreversible platelet aggregation inhibition
Indication: Suspected ACS (chest pain of cardiac origin)
Dose: 324 mg chewed (four 81mg tablets OR one 325mg tablet) — chewing improves absorption speed
Contraindications: known aspirin allergy, active GI bleeding, children <16 years (Reye syndrome risk)
Note: PDE-5 inhibitors (sildenafil, tadalafil) contraindicate NITROGLYCERIN, not aspirin.

## Nitroglycerin (NTG) — 0.4 mg Sublingual
Mechanism: Nitric oxide donor; venodilation reduces preload; coronary vasodilation
Indication: Chest pain of suspected cardiac origin (must have patient's own prescription)
Dose: 0.4 mg sublingual tablet or spray — repeat every 5 min up to 3 doses if BP ≥90 systolic
Contraindications:
- Systolic BP <90 mmHg (absolute)
- PDE-5 inhibitors: sildenafil within 24 hours, tadalafil within 48 hours (life-threatening hypotension)
- Right ventricular/inferior MI (relative — consult medical direction)
- Head injury/increased ICP
Monitor BP before EACH dose.

## Epinephrine Auto-injector
Mechanism: Alpha-1 vasoconstriction; Beta-1 positive chronotropy/inotropy; Beta-2 bronchodilation
Indication: Anaphylaxis/severe allergic reaction
Dose: Adult 0.3 mg IM; Pediatric <30 kg: 0.15 mg IM
Route: Anterolateral thigh (vastus lateralis), can administer through clothing
Concentration: 1:1000 (1 mg/mL) — auto-injector only at EMT scope (NOT IV)
May repeat in 5-15 minutes if no clinical improvement.

## Albuterol (Beta-2 Agonist)
Mechanism: Beta-2 adrenergic agonist; bronchial smooth muscle relaxation; bronchodilation
Indication: Bronchospasm (asthma, COPD exacerbation)
Dose: 2 puffs MDI (90 mcg/puff) OR 2.5 mg via nebulizer
Tachycardia is an EXPECTED side effect — do NOT withhold in bronchospasm.
Patient must have own prescribed inhaler at EMT scope.

## Oral Glucose
Mechanism: Direct glucose substrate replenishment
Indication: Hypoglycemia with altered mental status
CRITICAL CONTRAINDICATION: Patient must be CONSCIOUS with intact gag reflex. CONTRAINDICATED if unconscious or unable to swallow — aspiration risk.
Dose: 15-25g (one tube gel); may rub inside cheek for buccal absorption if semi-conscious.

## Naloxone (Narcan) — AHA 2025 BLS Integration
Mechanism: Competitive opioid receptor antagonist (mu, kappa, delta receptors)
Indication: Suspected opioid overdose with respiratory depression; integrated into BLS algorithm (AHA 2025)
Dose: 4 mg intranasal (2 mg per nostril) at EMT scope
Duration: 30-90 minutes — CRITICAL: Naloxone duration is SHORTER than most opioids. Re-sedation is expected. Continuous monitoring required.
May repeat every 2-3 minutes if no response.

## Airway Management — EMT Scope
OPA (Oropharyngeal Airway): Used in unconscious patients WITH NO gag reflex
NPA (Nasopharyngeal Airway): Used when OPA contraindicated; tolerated in semi-conscious patients with intact gag reflex
BVM: Bag-valve-mask; 15 LPM O2; proper mask seal and jaw thrust critical
Ventilation rate: Adult 1 breath per 5-6 seconds (10-12/min); avoid hyperventilation

## Patient Assessment Framework
Primary Survey: ABCDE (Airway, Breathing, Circulation, Disability, Expose)
SAMPLE History: Signs/Symptoms, Allergies, Medications, Pertinent history, Last oral intake, Events
OPQRST: Onset, Provocation/Palliation, Quality, Radiation, Severity, Time
Vital signs: HR, BP, RR, SpO2, skin (temp/color/moisture), pupils
AVPU scale: Alert, Verbal, Pain, Unresponsive
`,
  },
  {
    source: "EMT_B_Cardiac_Shock_Trauma_Stroke_Seizure",
    content: `# EMT-B Clinical: Cardiac, Shock, Trauma, Stroke, Seizure

## Acute Coronary Syndrome (ACS) Recognition
Classic presentation: Crushing/pressure chest pain, diaphoresis, nausea, radiation to left arm/jaw
Atypical ACS presentations (more common in women, elderly, diabetics): Jaw pain only, epigastric pain, nausea/vomiting without chest pain, fatigue, dyspnea without pain
NREMT emphasis: Do NOT rule out ACS based on absence of chest pain.

## Shock Recognition and Types
Shock = inadequate tissue perfusion. Key recognition:
- Early/compensated shock: Tachycardia, pale/cool/diaphoretic skin, anxiety, BP may be NORMAL
- Late/decompensated shock: Hypotension, altered mental status, markedly decreased perfusion
CRITICAL: Hypotension is a LATE sign of shock — do not wait for BP drop to treat.
Types: Cardiogenic (pump failure), Hypovolemic (blood/fluid loss), Distributive (septic/anaphylactic/neurogenic), Obstructive (tension PTX/tamponade)

## Tension Pneumothorax (Cushing's Triad vs Beck's Triad)
Tension PTX signs: Tracheal deviation (AWAY from affected side), absent breath sounds unilaterally, JVD, hypotension, tachycardia
Beck's Triad (Cardiac Tamponade): Hypotension + JVD + Muffled heart sounds
Cushing's Triad (Increased ICP/TBI): Hypertension + Bradycardia + Irregular respirations (Cheyne-Stokes)

## Traumatic Brain Injury (TBI)
Cushing's Triad indicates herniation: Hypertension, Bradycardia, Irregular respirations
Signs of increasing ICP: Decreasing GCS, pupil changes (blown pupil = uncal herniation), posturing
Avoid hyperventilation unless herniation signs present (can cause cerebral vasoconstriction)

## Hemorrhagic Shock Management
Tourniquet: Apply 2-3 inches proximal to wound, tighten until bleeding stops, note time
Wound packing: For junctional wounds not amenable to tourniquet
Hemostatic dressings: Apply firm direct pressure for minimum 3 minutes

## Stroke Assessment
Cincinnati Stroke Scale: Facial droop + Arm drift + Speech abnormality = high stroke probability
Time is CRITICAL: "Time is brain" — 1.9 million neurons lost per minute in stroke
Key metric: Last known well (LKW) time — determines tPA eligibility window (generally 4.5 hours)
EMT role: Document exact LKW time, rapid transport to stroke center, do NOT delay transport

## Seizure Management
Post-ictal state: Expected confusion/lethargy after grand mal seizure
Priority: Protect from injury, maintain airway, recover position (lateral), supplemental O2
Status epilepticus: Seizure >5 min or recurrent seizures without recovery; requires ALS intercept
Do NOT restrain violently; do NOT insert anything in mouth during active seizure

## Pediatric Considerations — Cardiac Arrest
Pediatric cardiac arrests are typically respiratory in origin (hypoxic), not cardiac.
Priority: High-quality oxygenation and ventilation before electrical interventions.
2-rescuer infant CPR ratio: 15:2 (different from adult 30:2)
AED: Pediatric-attenuated pads preferred for <8 years or <55 lbs; adult pads acceptable if no pediatric available

## Obstetric Emergency
Supine hypotensive syndrome: Gravid uterus compresses IVC — position in left lateral decubitus or manual uterine displacement
Delivery complications: cord prolapse → knee-chest position + manual cord elevation; placenta previa (painless bright red bleeding); abruptio placentae (painful dark red bleeding with rigid abdomen)

## Glucose Emergencies
Hypoglycemia: BGL <60 mg/dL; altered mental status, diaphoresis, tachycardia; cold/pale/moist skin
Hyperglycemia: BGL >200 mg/dL; gradual onset, polyuria/polydipsia/polyphagia; warm/dry/flushed skin; Kussmaul respirations (DKA), fruity breath odor
Key distinction: Hypoglycemia — cold, pale, moist, FAST onset; Hyperglycemia — warm, dry, flushed, SLOW onset

## CPR Training Age Recommendations (AHA 2025)
CPR training for children ≥12 years old: Class 1 recommendation (new 2025 — should be trained)
Cognitive aids (laminated cards, apps): Class 2b for HCPs (reasonable); Class 3 for lay rescuers (not recommended — may distract from CPR quality)
`,
  },
] as const;
