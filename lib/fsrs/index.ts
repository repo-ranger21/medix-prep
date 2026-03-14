import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade, type RecordLog } from "ts-fsrs";
import {
  RETENTION_TARGETS,
  TOPIC_CRITICALITY,
  XP_BASE,
  CRITICALITY_MULTIPLIER,
  type ContentCriticality,
  type DueCard,
} from "@/types/fsrs.types";

export type { ContentCriticality };
export { Rating };

const FSRS_INSTANCES = {
  life_critical: fsrs(
    generatorParameters({
      request_retention: RETENTION_TARGETS.life_critical.request_retention,
      maximum_interval: RETENTION_TARGETS.life_critical.maximum_interval,
    })
  ),
  high: fsrs(
    generatorParameters({
      request_retention: RETENTION_TARGETS.high.request_retention,
      maximum_interval: RETENTION_TARGETS.high.maximum_interval,
    })
  ),
  standard: fsrs(
    generatorParameters({
      request_retention: RETENTION_TARGETS.standard.request_retention,
      maximum_interval: RETENTION_TARGETS.standard.maximum_interval,
    })
  ),
};

export function getFsrsForTopic(topicCategory: string) {
  const criticality = TOPIC_CRITICALITY[topicCategory] ?? "standard";
  return FSRS_INSTANCES[criticality];
}

export function getCriticalityForTopic(topicCategory: string): ContentCriticality {
  return TOPIC_CRITICALITY[topicCategory] ?? "standard";
}

export interface ScheduleResult {
  updatedCard: Card;
  scheduledDays: number;
  dueDate: Date;
  state: State;
}

export function scheduleReview(
  card: Card,
  rating: Rating,
  topicCategory: string,
  reviewDate?: Date
): ScheduleResult {
  const f = getFsrsForTopic(topicCategory);
  const now = reviewDate ?? new Date();
  const recordLog: RecordLog = f.repeat(card, now);
  // Rating.Manual (0) is excluded from RecordLog — callers must only pass Grade values (Again/Hard/Good/Easy)
  const result = recordLog[rating as Grade];
  return {
    updatedCard: result.card,
    scheduledDays: result.card.scheduled_days,
    dueDate: result.card.due,
    state: result.card.state,
  };
}

export function calculateXp(
  rating: Rating,
  topicCategory: string,
  responseTimeMs: number
): number {
  const base = XP_BASE[rating] ?? 0;
  const criticality = getCriticalityForTopic(topicCategory);
  const multiplier = CRITICALITY_MULTIPLIER[criticality];
  const speedBonus = responseTimeMs < 10000 ? 1.1 : 1.0;
  return Math.round(base * multiplier * speedBonus);
}

export function createNewCard(): Card {
  return createEmptyCard();
}

export function buildStudyQueue(cards: DueCard[]): DueCard[] {
  const statePriority: Record<string, number> = {
    Relearning: 0,
    Learning: 1,
    Review: 2,
    New: 3,
  };

  return [...cards].sort((a, b) => {
    const pa = statePriority[a.state] ?? 99;
    const pb = statePriority[b.state] ?? 99;
    if (pa !== pb) return pa - pb;
    return new Date(a.due).getTime() - new Date(b.due).getTime();
  });
}

export function estimateRetention(card: Card): number {
  if (card.stability === 0) return 0;
  const daysSinceReview = card.elapsed_days;
  // R(t) = e^(-t/S) — approximate retention formula
  return Math.exp(-daysSinceReview / card.stability);
}

export interface TopicMastery {
  masteryScore: number;
  matureCards: number;
  youngCards: number;
  learningCards: number;
  newCards: number;
  totalCards: number;
}

export function calculateTopicMastery(cards: Card[]): TopicMastery {
  const matureCards = cards.filter((c) => c.scheduled_days >= 21).length;
  const youngCards = cards.filter((c) => c.scheduled_days >= 1 && c.scheduled_days < 21).length;
  const learningCards = cards.filter((c) => c.state === State.Learning || c.state === State.Relearning).length;
  const newCards = cards.filter((c) => c.state === State.New).length;
  const total = cards.length;

  const masteryScore =
    total === 0
      ? 0
      : Math.round(((matureCards * 1.0 + youngCards * 0.6 + learningCards * 0.2) / total) * 100);

  return { masteryScore, matureCards, youngCards, learningCards, newCards, totalCards: total };
}
