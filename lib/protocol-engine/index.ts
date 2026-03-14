import { CPR_PARAMS, CHAIN_OF_SURVIVAL, POST_ROSC_TARGETS, HS_AND_TS, SHOCKABLE_RHYTHMS, CPR_QUALITY_ELEMENTS, HEAD_UP_CPR_2025, INFANT_TWO_FINGER_ELIMINATED_2025 } from "./cardiac-arrest";import { EMT_DRUG_FORMULARY } from "./drug-formulary";
import { AED_STEPS, AED_PAD_PLACEMENT, AED_BRA_GUIDANCE_2025, PEDIATRIC_AED_2025_UPDATE } from "./aed";
import { ADULT_CHILD_FBAO, INFANT_FBAO, FBAO_SPECIAL_POPULATIONS } from "./fbao";
import { SCOPE_OF_PRACTICE, CERT_LEVEL_HIERARCHY, isTopicInScope, isWithinScope, ALS_KEYWORDS } from "./scope-of-practice";
import type { ProtocolFact } from "@/types/protocol.types";
import type { CertLevel } from "@/types/database.types";

export { CPR_PARAMS, CHAIN_OF_SURVIVAL, POST_ROSC_TARGETS, HEAD_UP_CPR_2025, INFANT_TWO_FINGER_ELIMINATED_2025, HS_AND_TS, SHOCKABLE_RHYTHMS, CPR_QUALITY_ELEMENTS };
export { EMT_DRUG_FORMULARY };
export { AED_STEPS, AED_PAD_PLACEMENT, AED_BRA_GUIDANCE_2025, PEDIATRIC_AED_2025_UPDATE };
export { ADULT_CHILD_FBAO, INFANT_FBAO, FBAO_SPECIAL_POPULATIONS };
export { SCOPE_OF_PRACTICE, CERT_LEVEL_HIERARCHY, isTopicInScope, isWithinScope, ALS_KEYWORDS };

export function getCprParams(ageGroup: "adult" | "child" | "infant") {
  return CPR_PARAMS[ageGroup];
}

export function getVentilationParams(ageGroup: "adult" | "child" | "infant") {
  const rates = { adult: 10, child: 12, infant: 20 };
  return {
    ratePerMinute: rates[ageGroup],
    tidalVolumeDesc: ageGroup === "adult" ? "500-600 mL (chest rise visible)" : "enough to produce visible chest rise",
    ratio: "30:2 (single rescuer) or 15:2 (dual rescuer, child/infant)",
    avoidHyperventilation: true as const,
  };
}

export function lookupDrug(drugName: string) {
  const normalized = drugName.toLowerCase().replace(/[^a-z]/g, "");
  const aliases: Record<string, keyof typeof EMT_DRUG_FORMULARY> = {
    oxygen: "oxygen",
    o2: "oxygen",
    aspirin: "aspirin",
    asa: "aspirin",
    oralglucose: "oralGlucose",
    glucose: "oralGlucose",
    glucosegel: "oralGlucose",
    epinephrine: "epinephrine",
    epi: "epinephrine",
    adrenaline: "epinephrine",
    albuterol: "albuterol",
    salbutamol: "albuterol",
    proventil: "albuterol",
    nitroglycerin: "nitroglycerin",
    ntg: "nitroglycerin",
    nitro: "nitroglycerin",
    naloxone: "naloxone",
    narcan: "naloxone",
  };
  const key = aliases[normalized];
  return key ? EMT_DRUG_FORMULARY[key] : null;
}

export function checkScope(topic: string, certLevel: CertLevel) {
  return isTopicInScope(topic, certLevel);
}

export function getNormalVitals() {
  return {
    adult: { hr: "60-100 bpm", bp: "90-140/60-90 mmHg", rr: "12-20/min", spo2: "95-100%", temp: "97-99°F (36.1-37.2°C)" },
    child: { hr: "70-130 bpm", bp: "80-110 systolic", rr: "15-30/min", spo2: "95-100%" },
    infant: { hr: "100-160 bpm", bp: "60-90 systolic", rr: "25-50/min", spo2: "95-100%" },
  };
}

export function extractRelevantFacts(query: string): ProtocolFact[] {
  const facts: ProtocolFact[] = [];
  const q = query.toLowerCase();

  // CPR / cardiac arrest
  if (q.includes("cpr") || q.includes("cardiac arrest") || q.includes("compression")) {
    facts.push(
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "adult_compression_rate", value: "100-120/min", certainty: "definitive" },
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "adult_compression_depth", value: "2-2.4 inches", certainty: "definitive" },
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "max_pause_seconds", value: 10, certainty: "definitive" },
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "ccf_target", value: "≥0.80", certainty: "definitive" },
    );
  }

  // Chain of survival
  if (q.includes("chain of survival")) {
    facts.push({
      source: "AHA 2025 BLS",
      category: "cardiac_arrest",
      key: "chain_of_survival_links",
      value: CHAIN_OF_SURVIVAL.map((l) => l.name),
      certainty: "definitive",
    });
  }

  // Infant CPR
  if (q.includes("infant") && (q.includes("cpr") || q.includes("compressions"))) {
    facts.push(
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "infant_technique_2025", value: "Two-thumb encircling technique; two-finger technique ELIMINATED 2025", certainty: "definitive" },
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "infant_depth", value: "~1.5 inches", certainty: "definitive" },
    );
  }

  // Drug-specific
  if (q.includes("nitroglycerin") || q.includes("ntg") || q.includes("nitro")) {
    facts.push(
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "ntg_dose", value: "0.4mg SL", certainty: "definitive" },
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "ntg_contraindication_bp", value: "Systolic BP <90 mmHg", certainty: "definitive" },
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "ntg_contraindication_pde5", value: "Sildenafil within 24h, Tadalafil within 48h", certainty: "definitive" },
    );
  }

  if (q.includes("epinephrine") || q.includes("epi") || q.includes("anaphylaxis")) {
    facts.push(
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "epi_adult_dose", value: "0.3mg IM anterolateral thigh", certainty: "definitive" },
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "epi_peds_dose", value: "0.15mg IM (<30 kg)", certainty: "definitive" },
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "epi_concentration", value: "1:1000 (auto-injector, NOT IV at EMT scope)", certainty: "definitive" },
    );
  }

  if (q.includes("naloxone") || q.includes("narcan")) {
    facts.push(
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "naloxone_dose", value: "4mg IN (2mg per nostril)", certainty: "definitive" },
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "naloxone_duration", value: "30-90 min (shorter than most opioids — re-sedation risk)", certainty: "definitive" },
    );
  }

  if (q.includes("aspirin") || q.includes("asa")) {
    facts.push(
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "aspirin_dose", value: "324mg chewed", certainty: "definitive" },
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "aspirin_mechanism", value: "COX-1 inhibitor — platelet aggregation inhibition", certainty: "definitive" },
    );
  }

  if (q.includes("oral glucose") || q.includes("glucose")) {
    facts.push(
      { source: "EMT Drug Formulary", category: "drug_formulary", key: "oral_glucose_contraindication", value: "CONTRAINDICATED if unconscious or no gag reflex", certainty: "definitive" },
    );
  }

  // AED
  if (q.includes("aed") || q.includes("defibrillat") || q.includes("bra")) {
    facts.push(
      { source: "AHA 2025 BLS", category: "aed", key: "bra_guidance_2025", value: "Class 2b: may adjust rather than remove bra", certainty: "guideline" },
      { source: "AHA 2025 BLS", category: "aed", key: "resume_cpr_after_shock", value: "Immediately resume CPR — do not check pulse first", certainty: "definitive" },
    );
  }

  // FBAO
  if (q.includes("choking") || q.includes("fbao") || q.includes("foreign body") || q.includes("obstruction")) {
    if (q.includes("infant")) {
      facts.push(
        { source: "AHA 2025 BLS", category: "fbao", key: "infant_fbao", value: "5 back blows + 5 chest THRUSTS (NOT compressions). Abdominal thrusts CONTRAINDICATED.", certainty: "definitive" },
      );
    } else {
      facts.push(
        { source: "AHA 2025 BLS", category: "fbao", key: "adult_fbao", value: "5-and-5 algorithm: 5 back blows then 5 abdominal thrusts, alternating", certainty: "definitive" },
      );
    }
  }

  // Post-ROSC
  if (q.includes("rosc") || q.includes("post-cardiac") || q.includes("post cardiac") || q.includes("return of spontaneous")) {
    facts.push(
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "post_rosc_spo2", value: "90-98% (avoid hyperoxia)", certainty: "definitive" },
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "post_rosc_map", value: "MAP ≥65 mmHg (NOT systolic BP target)", certainty: "definitive" },
    );
  }

  // Head-up CPR
  if (q.includes("head-up") || q.includes("head up") || q.includes("elevated cpr")) {
    facts.push(
      { source: "AHA 2025 BLS", category: "cardiac_arrest", key: "head_up_cpr_2025", value: "Class 3: NOT recommended except in clinical trials", certainty: "definitive" },
    );
  }

  return facts;
}
