import type { Card, Rating } from "ts-fsrs";

export type ContentCriticality = "life_critical" | "high" | "standard";

export const RETENTION_TARGETS: Record<
  ContentCriticality,
  { request_retention: number; maximum_interval: number }
> = {
  life_critical: { request_retention: 0.95, maximum_interval: 180 },
  high: { request_retention: 0.9, maximum_interval: 365 },
  standard: { request_retention: 0.85, maximum_interval: 365 },
};

export const TOPIC_CRITICALITY: Record<string, ContentCriticality> = {
  cardiac_arrest: "life_critical",
  drug_formulary: "life_critical",
  airway_emergency: "life_critical",
  shock: "life_critical",
  anaphylaxis: "life_critical",
  trauma_critical: "life_critical",
  anatomy: "high",
  physiology: "high",
  airway_management: "high",
  patient_assessment: "high",
  pediatric: "high",
  obstetric: "high",
  documentation: "standard",
  communications: "standard",
  legal_ethics: "standard",
  operations: "standard",
};

export const XP_BASE: Record<Rating, number> = {
  0: 0,   // Manual
  1: 5,   // Again
  2: 15,  // Hard
  3: 25,  // Good
  4: 30,  // Easy
};

export const CRITICALITY_MULTIPLIER: Record<ContentCriticality, number> = {
  life_critical: 1.5,
  high: 1.25,
  standard: 1.0,
};

export interface MedixCard {
  id: string;
  user_id: string;
  question_id: string;
  fsrs_card: Card;
  topic_category: string;
}

export interface DueCard {
  card_id: string;
  question_id: string;
  due: string;
  state: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  last_review: string | null;
  stem: string;
  answer_options: import("./database.types").AnswerOption[];
  correct_answer_id: string;
  detailed_explanation: string;
  clinical_reasoning: string | null;
  protocol_references: import("./database.types").ProtocolReference[] | null;
  topic_category: string;
  subtopic: string | null;
  difficulty_level: number;
  cert_level: import("./database.types").CertLevel;
}

export interface ReviewSubmission {
  question_id: string;
  card_id: string | null;
  rating: Rating;
  response_time_ms: number;
  topic_category: string;
}

export interface StudyGoal {
  cards_per_day: number;
  target_retention: number;
  focus_topics: string[];
}
