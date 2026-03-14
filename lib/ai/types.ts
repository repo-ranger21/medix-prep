import type { CertLevel } from "@/types/database.types";

export type TutorMode = "explain" | "quiz" | "scenario_coach" | "cram" | "chat";

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  userId: string;
  certLevel: CertLevel;
  message: string;
  conversationHistory: TutorMessage[];
  mode?: TutorMode;
  questionContext?: {
    stem: string;
    topic: string;
    wasCorrect: boolean;
    correctAnswer?: string;
  };
}

export interface GuardianViolation {
  issueType:
    | "wrong_dose"
    | "wrong_contraindication"
    | "out_of_scope"
    | "hallucinated_fact"
    | "unsupported_claim";
  severity: "critical" | "warning" | "info";
  description: string;
  correction?: string;
}

export interface GuardianRequest {
  responseText: string;
  certLevel: CertLevel;
  query: string;
  protocolFacts: Array<{ key: string; value: string | number | boolean | string[] }>;
}

export interface GuardianResult {
  passed: boolean;
  violations: GuardianViolation[];
  correctedResponse: string | null;
  confidenceScore: number;
  notes: string;
}

export interface AuditLogEntry {
  userId: string | null;
  certLevel: CertLevel | null;
  queryText: string;
  retrievedChunkIds: string[];
  modelUsed: string;
  responseText: string;
  confidenceScore: number | null;
  guardianPassed: boolean;
  guardianNotes: string;
  latencyMs: number;
  flaggedForReview: boolean;
}

export interface ModelConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  tier: "fast" | "powerful";
}
