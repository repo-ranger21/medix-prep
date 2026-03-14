import type { ScopeEntry } from "@/types/protocol.types";
import type { CertLevel } from "@/types/database.types";

export const CERT_LEVEL_HIERARCHY: Record<CertLevel, number> = {
  BLS: 0,
  EMR: 1,
  EMT: 2,
  AEMT: 3,
  Paramedic: 4,
};

export const SCOPE_OF_PRACTICE: ScopeEntry[] = [
  // Airway
  { skill: "Mouth-to-mouth / pocket mask", category: "airway", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "BVM ventilation", category: "airway", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "OPA insertion", category: "airway", allowedLevels: ["EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "NPA insertion", category: "airway", allowedLevels: ["EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Supraglottic airway (SGA/LMA)", category: "airway", allowedLevels: ["AEMT", "Paramedic"] },
  { skill: "Endotracheal intubation", category: "airway", allowedLevels: ["Paramedic"] },
  { skill: "Surgical cricothyrotomy", category: "airway", allowedLevels: ["Paramedic"] },
  // Cardiac
  { skill: "CPR", category: "cardiac", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "AED use", category: "cardiac", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "12-lead ECG acquisition", category: "cardiac", allowedLevels: ["AEMT", "Paramedic"] },
  { skill: "Manual defibrillation", category: "cardiac", allowedLevels: ["Paramedic"] },
  { skill: "Transcutaneous pacing", category: "cardiac", allowedLevels: ["Paramedic"] },
  { skill: "Synchronized cardioversion", category: "cardiac", allowedLevels: ["Paramedic"] },
  // Medications
  { skill: "Oxygen administration", category: "medications", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Aspirin (oral)", category: "medications", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "Oral glucose", category: "medications", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "Epinephrine auto-injector", category: "medications", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "Albuterol (patient-assisted)", category: "medications", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "Nitroglycerin (patient-assisted)", category: "medications", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "Naloxone IN", category: "medications", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "IV/IO access", category: "vascular_access", allowedLevels: ["AEMT", "Paramedic"] },
  { skill: "IV medications (ALS formulary)", category: "medications", allowedLevels: ["AEMT", "Paramedic"] },
  // Trauma
  { skill: "Tourniquet application", category: "trauma", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Wound packing", category: "trauma", allowedLevels: ["EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Needle chest decompression", category: "trauma", allowedLevels: ["Paramedic"] },
  // Assessment
  { skill: "Primary survey (ABCDE)", category: "assessment", allowedLevels: ["BLS", "EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Patient history (SAMPLE/OPQRST)", category: "assessment", allowedLevels: ["EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Vital signs", category: "assessment", allowedLevels: ["EMR", "EMT", "AEMT", "Paramedic"] },
  { skill: "Blood glucose monitoring", category: "assessment", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "SpO2 monitoring", category: "assessment", allowedLevels: ["EMT", "AEMT", "Paramedic"] },
  { skill: "ETCO2 monitoring", category: "assessment", allowedLevels: ["AEMT", "Paramedic"] },
];

export function isWithinScope(skillLevel: CertLevel, userLevel: CertLevel): boolean {
  return CERT_LEVEL_HIERARCHY[userLevel] >= CERT_LEVEL_HIERARCHY[skillLevel];
}

export function isTopicInScope(
  topic: string,
  userCertLevel: CertLevel
): { inScope: boolean; minimumLevel: CertLevel | null; redirectMessage: string } {
  const alsTopics = ["intubation", "iv access", "iv medication", "pacing", "cardioversion", "12-lead"];
  const lowerTopic = topic.toLowerCase();

  const isAlsTopic = alsTopics.some((t) => lowerTopic.includes(t));

  if (isAlsTopic && CERT_LEVEL_HIERARCHY[userCertLevel] < CERT_LEVEL_HIERARCHY["AEMT"]) {
    return {
      inScope: false,
      minimumLevel: "AEMT",
      redirectMessage: `This topic (${topic}) is above EMT scope of practice. I can explain the concept for educational awareness, but this skill requires AEMT or Paramedic certification.`,
    };
  }

  return { inScope: true, minimumLevel: null, redirectMessage: "" };
}

export const ALS_KEYWORDS = [
  "intubation", "endotracheal", "RSI", "IV push", "IO access",
  "vasopressor", "dopamine", "epinephrine drip", "lidocaine IV",
  "amiodarone", "adenosine", "synchronized cardioversion",
  "transcutaneous pacing", "12-lead interpretation",
  "chest decompression", "surgical airway", "central line",
];
