import OpenAI from "openai";
import type { GuardianRequest, GuardianResult, GuardianViolation } from "./types";
import { buildGuardianSystemPrompt } from "./prompts";
import { getGuardianModel } from "./router";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function runGuardian(request: GuardianRequest): Promise<GuardianResult> {
  const model = getGuardianModel();

  const userMessage = `## Response to validate:
${request.responseText}

## Query that prompted this response:
${request.query}

## Cert Level: ${request.certLevel}

## Known protocol facts (ground truth):
${request.protocolFacts.map((f) => `- ${f.key}: ${JSON.stringify(f.value)}`).join("\n") || "None provided"}

Validate the response for clinical accuracy.`;

  try {
    const response = await openai.chat.completions.create({
      model: model.model,
      temperature: model.temperature,
      max_tokens: model.maxTokens,
      messages: [
        { role: "system", content: buildGuardianSystemPrompt() },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return failOpen("Empty guardian response");
    }

    const parsed = JSON.parse(content) as {
      passed: boolean;
      violations: GuardianViolation[];
      correctedResponse: string | null;
      confidenceScore: number;
      notes: string;
    };

    return {
      passed: parsed.passed ?? true,
      violations: parsed.violations ?? [],
      correctedResponse: parsed.correctedResponse ?? null,
      confidenceScore: parsed.confidenceScore ?? 0.8,
      notes: parsed.notes ?? "",
    };
  } catch (error) {
    console.error("Guardian error (failing open):", error);
    return failOpen("Guardian error — response allowed through with reduced confidence");
  }
}

function failOpen(notes: string): GuardianResult {
  return {
    passed: true,
    violations: [],
    correctedResponse: null,
    confidenceScore: 0.4,
    notes,
  };
}

export function resolveFinalResponse(
  originalResponse: string,
  guardianResult: GuardianResult
): { finalResponse: string; flagged: boolean } {
  const criticalViolations = guardianResult.violations.filter(
    (v) => v.severity === "critical"
  );

  if (criticalViolations.length > 0 && guardianResult.correctedResponse) {
    return { finalResponse: guardianResult.correctedResponse, flagged: true };
  }

  if (guardianResult.confidenceScore < 0.5) {
    const caveat =
      "\n\n---\n*⚠️ Note: This response has been flagged for clinical review. Always verify drug doses and protocols against your local EMS protocols and medical direction.*";
    return { finalResponse: originalResponse + caveat, flagged: true };
  }

  return { finalResponse: originalResponse, flagged: false };
}
