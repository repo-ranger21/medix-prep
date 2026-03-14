import type { FbaoProtocol } from "@/types/protocol.types";

/** AHA 2025: 5-and-5 algorithm formalized */
export const ADULT_CHILD_FBAO: FbaoProtocol = {
  algorithm: "5-and-5 (AHA 2025 formalized)",
  steps: [
    "1. Confirm complete obstruction: Ask 'Are you choking?' — cannot speak, cough, or breathe",
    "2. Call for help / activate EMS",
    "3. Deliver 5 firm back blows between shoulder blades with heel of hand",
    "4. Deliver 5 abdominal thrusts (Heimlich): stand behind, fist above navel below xiphoid, pull inward-and-upward",
    "5. Alternate 5 back blows and 5 abdominal thrusts until object expelled or patient loses consciousness",
    "6. If patient loses consciousness: lower to ground, call 911, begin CPR, look for and remove object with each airway opening",
  ],
  specialConsiderations: [
    "If patient becomes unconscious: start CPR immediately",
    "Do NOT perform blind finger sweeps — only remove object if visible",
    "For obese or pregnant patients: use chest thrusts instead of abdominal thrusts",
  ],
};

export const INFANT_FBAO: FbaoProtocol = {
  algorithm: "5 Back Blows + 5 Chest THRUSTS (NOT compressions — AHA 2025)",
  steps: [
    "1. Confirm obstruction: infant cannot cry, cough, or breathe effectively",
    "2. Hold infant face-down on forearm, supporting head; use heel-of-1-hand technique",
    "3. Deliver 5 firm back blows between shoulder blades",
    "4. Turn infant face-up, support head; deliver 5 chest THRUSTS (2-finger technique on lower half of sternum)",
    "5. Alternate 5 back blows and 5 chest thrusts until object expelled or infant loses consciousness",
    "6. If infant loses consciousness: begin infant CPR, look for object with each airway opening",
  ],
  contraindications: [
    "Abdominal thrusts CONTRAINDICATED in infants — risk of organ injury",
    "Do NOT use abdominal thrusts (Heimlich) for infants <1 year",
  ],
  specialConsiderations: [
    "Term: CHEST THRUSTS, not compressions — AHA 2025 language is intentional",
    "Heel-of-1-hand technique for back blows in infants",
  ],
};

export const FBAO_SPECIAL_POPULATIONS = {
  obese: {
    modification: "Chest thrusts instead of abdominal thrusts",
    rationale: "Cannot encircle abdomen effectively",
  },
  pregnant: {
    modification: "Chest thrusts instead of abdominal thrusts",
    rationale: "Protect fetus; enlarged uterus limits effectiveness of abdominal thrusts",
  },
} as const;
