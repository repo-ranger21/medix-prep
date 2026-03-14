import type { DrugFormularyEntry } from "@/types/protocol.types";

export const EMT_DRUG_FORMULARY = {
  oxygen: {
    name: "Oxygen",
    scope: "BLS",
    dose: "NRB: 10-15 LPM; NC: 1-6 LPM; BVM: 15 LPM",
    route: "Inhalation",
    mechanism: "Increases arterial oxygen saturation and tissue oxygen delivery",
    indications: [
      "Hypoxia (SpO2 <94%)",
      "Respiratory distress",
      "Carbon monoxide poisoning (always NRB regardless of SpO2)",
      "Shock",
      "Cardiac arrest",
    ],
    contraindications: ["None absolute at EMT level"],
    sideEffects: ["Oxygen toxicity with prolonged high-flow use"],
    notes: [
      "CO poisoning: ALWAYS use NRB 10-15 LPM regardless of SpO2 reading",
      "Pulse ox unreliable in CO poisoning",
    ],
  } satisfies DrugFormularyEntry,

  aspirin: {
    name: "Aspirin",
    scope: "EMT",
    dose: "324 mg chewed (four 81mg tablets or one 325mg tablet)",
    route: "Oral (chewed, not swallowed whole)",
    mechanism: "COX-1 inhibitor; irreversible platelet aggregation inhibition",
    indications: ["Suspected ACS (chest pain of cardiac origin)"],
    contraindications: [
      "Known aspirin allergy",
      "Active GI bleeding",
      "Children <16 years (Reye syndrome risk)",
      "Recent GI surgery",
    ],
    sideEffects: ["GI upset", "Bleeding"],
    notes: [
      "Patient may have already taken aspirin today — still administer unless contraindicated",
      "324mg total dose (chewed for faster absorption)",
      "PDE-5 inhibitors (sildenafil, tadalafil, vardenafil) contraindicate nitroglycerin — NOT aspirin",
    ],
  } satisfies DrugFormularyEntry,

  oralGlucose: {
    name: "Oral Glucose",
    scope: "EMT",
    dose: "15-25g (one tube of glucose gel)",
    route: "Oral (buccal/sublingual absorption)",
    mechanism: "Direct glucose substrate replenishment",
    indications: [
      "Hypoglycemia with altered mental status",
      "Patient must be conscious and able to swallow",
    ],
    contraindications: [
      "UNCONSCIOUS patient (aspiration risk)",
      "Inability to swallow / absent gag reflex",
      "No gag reflex",
    ],
    sideEffects: ["Nausea"],
    notes: [
      "CRITICAL: CONTRAINDICATED if patient unconscious or cannot protect airway",
      "Rub inside cheek if patient cannot swallow",
    ],
  } satisfies DrugFormularyEntry,

  epinephrine: {
    name: "Epinephrine (Auto-injector)",
    scope: "EMT",
    dose: { adult: "0.3 mg IM", pediatric: "0.15 mg IM (patients <30 kg)" },
    route: "IM — anterolateral thigh (vastus lateralis), through clothing",
    mechanism: "Alpha-1: vasoconstriction; Beta-1: increased HR/contractility; Beta-2: bronchodilation",
    indications: ["Anaphylaxis / severe allergic reaction"],
    contraindications: ["No absolute contraindications in anaphylaxis at EMT scope"],
    sideEffects: [
      "Tachycardia",
      "Hypertension",
      "Anxiety/tremor",
      "Pallor",
    ],
    notes: [
      "Concentration: 1:1000 (1 mg/mL) — EMT scope is AUTO-INJECTOR only, NOT IV",
      "May repeat in 5-15 min if no improvement",
      "Anterolateral thigh preferred — can administer through clothing",
    ],
  } satisfies DrugFormularyEntry,

  albuterol: {
    name: "Albuterol",
    scope: "EMT",
    dose: "2 puffs MDI (90 mcg/puff) OR 2.5 mg nebulizer",
    route: "Inhalation",
    mechanism: "Beta-2 adrenergic agonist — bronchial smooth muscle relaxation",
    indications: [
      "Bronchospasm (asthma, COPD exacerbation)",
      "Patient must have prescribed inhaler",
    ],
    contraindications: ["Tachycardia >150 without bronchospasm"],
    sideEffects: [
      "Tachycardia (expected — not a contraindication in bronchospasm)",
      "Tremor",
      "Anxiety",
      "Hypokalemia",
    ],
    notes: [
      "Tachycardia is expected side effect — do NOT withhold for mild tachycardia",
      "May repeat every 5-20 min per protocol",
      "Patient must have own prescription (EMT-level protocol)",
    ],
  } satisfies DrugFormularyEntry,

  nitroglycerin: {
    name: "Nitroglycerin",
    scope: "EMT",
    dose: "0.4 mg sublingual (one tablet or one spray)",
    route: "Sublingual",
    mechanism: "Nitric oxide donor — venodilation reduces preload; coronary vasodilation",
    indications: [
      "Chest pain of suspected cardiac origin (ACS)",
      "Patient must have own prescribed NTG",
    ],
    contraindications: [
      "Systolic BP <90 mmHg",
      "Sildenafil (Viagra, Revatio) within 24 hours",
      "Tadalafil (Cialis, Adcirca) within 48 hours",
      "Vardenafil (Levitra) within 24 hours",
      "Right ventricular / inferior MI (relative — consult medical direction)",
      "Head injury / increased ICP",
    ],
    sideEffects: [
      "Hypotension",
      "Headache",
      "Reflex tachycardia",
      "Dizziness",
    ],
    notes: [
      "PDE-5 inhibitor (sildenafil 24h / tadalafil 48h) is ABSOLUTE contraindication",
      "BP check required before EACH dose",
      "May repeat every 5 min × 3 total doses if BP ≥90 systolic",
      "Inferior MI: BP may drop precipitously — use caution / consult medical direction",
    ],
  } satisfies DrugFormularyEntry,

  naloxone: {
    name: "Naloxone (Narcan)",
    scope: "EMT",
    dose: "4 mg intranasal (2 mg per nostril)",
    route: "Intranasal (IN) — EMT scope",
    mechanism: "Competitive opioid receptor antagonist (mu, kappa, delta)",
    indications: [
      "Suspected opioid overdose with respiratory depression",
      "Unresponsive with known or suspected opioid use",
    ],
    contraindications: ["Known hypersensitivity to naloxone"],
    sideEffects: [
      "Acute opioid withdrawal (agitation, vomiting, seizure in dependent patients)",
      "Re-sedation (naloxone duration 30-90 min — SHORTER than most opioids)",
    ],
    notes: [
      "CRITICAL: Duration 30-90 min — SHORTER than most opioids; patient may re-sedate",
      "AHA 2025: Naloxone integrated into BLS algorithm for suspected opioid cardiac arrest",
      "May repeat every 2-3 min if no response",
      "Continuous monitoring for re-sedation mandatory",
    ],
  } satisfies DrugFormularyEntry,
} as const;
