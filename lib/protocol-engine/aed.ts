export const AED_STEPS = [
  {
    step: 1,
    action: "Power ON the AED",
    detail: "Press power button or open lid",
  },
  {
    step: 2,
    action: "Expose chest and prepare skin",
    detail:
      "AHA 2025 Class 2b: For a bra, you may adjust/cut rather than remove if removal causes significant delay. Dry skin, remove patches.",
    ahaClass: "2b" as const,
  },
  {
    step: 3,
    action: "Attach pads",
    detail: "Right subclavicular (below clavicle, right of sternum) + Left lateral (left axilla, V4-V5)",
  },
  {
    step: 4,
    action: "Plug in connector / analyze rhythm",
    detail: "Ensure no one is touching patient during analysis",
  },
  {
    step: 5,
    action: "Clear and deliver shock if advised",
    detail: 'Announce "Clear!", visually verify, press shock button',
  },
  {
    step: 6,
    action: "Immediately resume CPR",
    detail: "Begin compressions immediately after shock — do not check pulse first",
  },
  {
    step: 7,
    action: "Continue 2-minute CPR cycles",
    detail: "Reanalyze every 2 minutes (5 CPR cycles)",
  },
] as const;

/** AHA 2025: Bra adjustment guidance — equity-focused update */
export const AED_BRA_GUIDANCE_2025 = {
  classOfRecommendation: "2b" as const,
  guidance:
    "For a patient wearing a bra, it may be reasonable to adjust or cut the bra rather than remove it entirely, provided this does not cause significant delay in defibrillation.",
  equityContext:
    "Women receive lower rates of public AED use; this guidance reduces barriers to bystander AED use.",
  year: 2025,
} as const;

export const AED_PAD_PLACEMENT = {
  standard: {
    pad1: "Right infraclavicular: below right clavicle, right of sternum",
    pad2: "Left lateral: left axillary area at V4-V5 level (nipple line)",
  },
  alternativePosterior: {
    pad1: "Anterior: left precordium",
    pad2: "Posterior: left infrascapular",
  },
  pacemakerGuidance:
    "Place pad at least 1 inch (2.5 cm) away from pacemaker/ICD device. Do NOT place pad directly over device.",
  medicationPatchRemoval: true,
  medicationPatchNote:
    "Remove medication patches before pad placement. Wipe skin dry. NTG patches must be removed.",
} as const;

/** AHA 2025: AED now recommended for infants <1yr when pediatric device available */
export const PEDIATRIC_AED_2025_UPDATE = {
  infantRecommendation:
    "AED use is recommended for infants <1 year of age when a manual defibrillator is not available.",
  devicePreference: "Pediatric-dose attenuated device preferred; if unavailable, use standard AED",
  year: 2025,
  classOfRecommendation: "2b" as const,
} as const;
