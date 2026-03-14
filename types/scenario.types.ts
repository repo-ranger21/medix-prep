export interface VitalSigns {
  hr: number;
  bp: string;
  rr: number;
  spo2: number;
  temp?: number;
  gcs?: number;
  etco2?: number;
  bgl?: number;
}

export type OutcomeType = "optimal" | "suboptimal" | "dangerous" | "terminal";

export interface ScenarioOption {
  id: string;
  text: string;
  outcomeType: OutcomeType;
  feedback: string;
  nextNodeId: string | null;
  scoreImpact: number;
}

export interface ScenarioNode {
  id: string;
  type: "assessment" | "intervention" | "decision" | "outcome";
  title: string;
  description: string;
  vitalSigns?: VitalSigns;
  options: ScenarioOption[];
  timeElapsedSeconds?: number;
  criticalAction?: boolean;
}

export interface ScenarioTree {
  rootNodeId: string;
  nodes: Record<string, ScenarioNode>;
}

export interface ScenarioDebrief {
  overallScore: number;
  maxScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  criticalErrors: string[];
  optimalActions: string[];
  missedOpportunities: string[];
  ariaAnalysis: string;
  timelineReview: Array<{
    timestamp: number;
    action: string;
    quality: OutcomeType;
  }>;
}
