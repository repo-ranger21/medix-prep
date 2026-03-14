import type { CprParameters, ReversibleCause } from "@/types/protocol.types";

export const CPR_PARAMS = {
  adult: {
    compressionRateMin: 100,
    compressionRateMax: 120,
    depthMin: 2.0,
    depthMax: 2.4,
    depthUnit: "inches",
    ratioSingleRescuer: "30:2",
    ratioDualRescuer: "30:2",
    handTechnique: "Two hands, heel of hand on lower half of sternum",
    maxPauseSeconds: 10,
    ccfTarget: 0.8,
  } satisfies CprParameters,
  child: {
    compressionRateMin: 100,
    compressionRateMax: 120,
    depthMin: 2.0,
    depthMax: 2.0,
    depthUnit: "inches",
    ratioSingleRescuer: "30:2",
    ratioDualRescuer: "15:2",
    handTechnique: "One or two hands, heel of hand(s) on lower half of sternum",
    maxPauseSeconds: 10,
    ccfTarget: 0.8,
  } satisfies CprParameters,
  infant: {
    compressionRateMin: 100,
    compressionRateMax: 120,
    depthMin: 1.5,
    depthMax: 1.5,
    depthUnit: "inches",
    ratioSingleRescuer: "30:2",
    ratioDualRescuer: "15:2",
    handTechnique: "Two-thumb encircling technique (dual rescuer); two-finger technique ELIMINATED 2025",
    maxPauseSeconds: 10,
    ccfTarget: 0.8,
  } satisfies CprParameters,
} as const;

/** AHA 2025: Two-finger technique for infant CPR is ELIMINATED */
export const INFANT_TWO_FINGER_ELIMINATED_2025 = {
  status: "ELIMINATED" as const,
  year: 2025,
  replacement: "Two-thumb encircling technique for all rescuers",
  reference: "AHA 2025 BLS Guidelines",
} as const;

/** AHA 2025 Chain of Survival — SIX links */
export const CHAIN_OF_SURVIVAL = [
  {
    link: 1,
    name: "Recognition and Activation",
    description: "Early recognition of cardiac arrest and activation of emergency response",
  },
  {
    link: 2,
    name: "High-Quality CPR",
    description: "Immediate high-quality CPR with minimal interruptions",
  },
  {
    link: 3,
    name: "Defibrillation",
    description: "Rapid defibrillation for shockable rhythms (VF/pVT)",
  },
  {
    link: 4,
    name: "Advanced Resuscitation",
    description: "ALS interventions: airway, IV/IO access, medications",
  },
  {
    link: 5,
    name: "Post-Cardiac Arrest Care",
    description: "Targeted temperature management, PCI, goal-directed therapy",
  },
  {
    link: 6,
    name: "Recovery and Survivorship",
    description: "Rehabilitation, surveillance, and long-term support (NEW 2025)",
  },
] as const;

/** AHA 2025 Post-ROSC Targets — MAP ≥65 per 2025 AHA Figure 7 */
export const POST_ROSC_TARGETS = {
  spo2Min: 90,
  spo2Max: 98,
  mapMin: 65,
  pco2Min: 35,
  pco2Max: 45,
  glucoseMin: 70,
  glucoseMax: 180,
  temperatureControlMin: 32,
  temperatureControlMax: 37.5,
  temperatureControlDurationHours: 36,
} as const;

/** AHA 2025: Head-up CPR — Class 3 NOT Recommended except in clinical trials */
export const HEAD_UP_CPR_2025 = {
  classOfRecommendation: "3" as const,
  recommendation: "NOT recommended except in the context of clinical trials",
  year: 2025,
  reference: "AHA 2025 Adult BLS Guidelines",
} as const;

export const HS_AND_TS: ReversibleCause[] = [
  { letter: "H1", name: "Hypovolemia", category: "H" },
  { letter: "H2", name: "Hypoxia", category: "H" },
  { letter: "H3", name: "Hydrogen ion (Acidosis)", category: "H" },
  { letter: "H4", name: "Hypo/Hyperkalemia", category: "H" },
  { letter: "H5", name: "Hypothermia", category: "H" },
  { letter: "T1", name: "Tension Pneumothorax", category: "T" },
  { letter: "T2", name: "Tamponade (Cardiac)", category: "T" },
  { letter: "T3", name: "Toxins", category: "T" },
  { letter: "T4", name: "Thrombosis (Pulmonary Embolism)", category: "T" },
  { letter: "T5", name: "Thrombosis (Coronary)", category: "T" },
];

export const SHOCKABLE_RHYTHMS = {
  shockable: ["Ventricular Fibrillation (VF)", "Pulseless Ventricular Tachycardia (pVT)"] as const,
  nonShockable: ["Pulseless Electrical Activity (PEA)", "Asystole"] as const,
} as const;

export const CPR_QUALITY_ELEMENTS = [
  "Rate: 100-120 compressions/min",
  "Depth: adequate (adult 2-2.4in, child ~2in, infant ~1.5in)",
  "Full chest recoil between compressions",
  "Minimize interruptions (CCF ≥0.80, pauses <10 sec)",
  "Avoid excessive ventilation (1 breath per 6 sec during continuous CPR)",
] as const;
