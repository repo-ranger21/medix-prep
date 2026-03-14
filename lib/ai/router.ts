import type { TutorMode } from "./types";
import type { ModelConfig } from "./types";

export const MODEL_FAST = "gpt-4o-mini";
export const MODEL_POWERFUL = "claude-sonnet-4-20250514";

const COMPLEX_QUERY_PATTERNS = [
  /differential\s+diagnosis/i,
  /physiological\s+mechanism/i,
  /pathophysiology/i,
  /compare\s+and\s+contrast/i,
  /explain\s+the\s+mechanism/i,
  /why\s+does\s+.+\s+cause/i,
  /hemodynamic/i,
  /pharmacokinetic/i,
];

export function selectModel(options: {
  mode: TutorMode;
  message: string;
  historyLength: number;
}): ModelConfig {
  const { mode, message, historyLength } = options;

  const isPowerful =
    mode === "scenario_coach" ||
    COMPLEX_QUERY_PATTERNS.some((p) => p.test(message)) ||
    message.length > 400 ||
    historyLength > 10;

  if (isPowerful) {
    return {
      model: MODEL_POWERFUL,
      temperature: 0.3,
      maxTokens: 2048,
      tier: "powerful",
    };
  }

  return {
    model: MODEL_FAST,
    temperature: 0.2,
    maxTokens: 1024,
    tier: "fast",
  };
}

export function getGuardianModel(): ModelConfig {
  return {
    model: MODEL_FAST,
    temperature: 0.1,
    maxTokens: 512,
    tier: "fast",
  };
}
