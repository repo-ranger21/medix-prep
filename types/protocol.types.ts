export interface CprParameters {
  compressionRateMin: number;
  compressionRateMax: number;
  depthMin: number;
  depthMax: number;
  depthUnit: "inches" | "cm";
  ratioSingleRescuer: string;
  ratioDualRescuer: string;
  handTechnique: string;
  maxPauseSeconds: number;
  ccfTarget: number;
}

export interface VentilationParameters {
  ratePerMinute: number;
  tidalVolumeDesc: string;
  ratio: string;
  avoidHyperventilation: true;
}

export interface AedPadPlacement {
  standard: { pad1: string; pad2: string };
  alternativePosterior: { pad1: string; pad2: string };
  pacemakerGuidance: string;
  medicationPatchRemoval: boolean;
}

export interface DrugFormularyEntry {
  name: string;
  scope: string;
  dose: string | { adult: string; pediatric: string };
  route: string;
  mechanism: string;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  notes: string[];
}

export interface FbaoProtocol {
  algorithm: string;
  steps: string[];
  contraindications?: string[];
  specialConsiderations?: string[];
}

export interface ScopeEntry {
  skill: string;
  category: string;
  allowedLevels: Array<"BLS" | "EMR" | "EMT" | "AEMT" | "Paramedic">;
}

export interface ReversibleCause {
  letter: string;
  name: string;
  category: "H" | "T";
}

export interface ProtocolFact {
  source: string;
  category: string;
  key: string;
  value: string | number | boolean | string[];
  certainty: "definitive" | "guideline" | "recommendation";
}
