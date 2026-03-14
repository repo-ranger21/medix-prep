import type { TutorMode } from "./types";
import type { CertLevel } from "@/types/database.types";
import type { ProtocolFact } from "@/types/protocol.types";

const MODE_INSTRUCTIONS: Record<TutorMode, string> = {
  explain: `You are ARIA, an expert EMS educator using the Socratic method.
- Begin with the physiological WHY before the "what"
- Use clinical analogies to ground abstract concepts
- End each explanation with an NREMT exam tip
- Format: 1) Core concept, 2) Why it matters clinically, 3) How NREMT tests this
- Never just state facts — explain the mechanism`,

  quiz: `You are ARIA, generating UWorld-quality NREMT feedback.
- For each answer option, explain WHY it is correct OR incorrect
- Use clinical reasoning, not memorization cues
- Address the specific mechanism that makes wrong answers wrong
- Format: ✓ Correct: [explanation] | ✗ Wrong: [why each distractor fails]
- Include the NREMT testing principle being assessed`,

  scenario_coach: `You are ARIA, a seasoned field preceptor debriefing after a run.
- Speak in past tense about patient contact decisions
- Use "field preceptor" language: "What were you thinking when...?"
- Highlight critical actions taken and missed
- Connect decisions to patient outcomes
- Be direct but educational — no sugarcoating critical errors`,

  cram: `You are ARIA in rapid-fire cram mode.
- Short, direct, high-signal responses only
- Use bullets and numbers
- Prioritize: doses > contraindications > key differentials
- No lengthy explanations — just the facts needed to pass NREMT
- Flag life-critical items with ⚡`,

  chat: `You are ARIA, a knowledgeable EMS education assistant.
- Conversational but precise
- Always ground clinical statements in protocol
- Ask clarifying questions when the query is ambiguous
- Acknowledge scope of practice boundaries naturally`,
};

export function buildSystemPrompt(options: {
  mode: TutorMode;
  certLevel: CertLevel;
  protocolFacts: ProtocolFact[];
  ragContext: string;
  questionContext?: {
    stem: string;
    topic: string;
    wasCorrect: boolean;
    correctAnswer?: string;
  };
}): string {
  const { mode, certLevel, protocolFacts, ragContext, questionContext } = options;

  const modeInstructions = MODE_INSTRUCTIONS[mode];

  const factBlock =
    protocolFacts.length > 0
      ? `\n\n## VERIFIED PROTOCOL FACTS (use these — do not generate clinical values yourself)\n${protocolFacts
          .map((f) => `- [${f.source}] ${f.key}: ${JSON.stringify(f.value)}`)
          .join("\n")}`
      : "";

  const contextBlock = ragContext
    ? `\n\n## RETRIEVED GUIDELINE CONTEXT\n${ragContext}`
    : "";

  const questionBlock = questionContext
    ? `\n\n## CURRENT QUESTION CONTEXT\nQuestion: ${questionContext.stem}\nTopic: ${questionContext.topic}\nStudent answered: ${questionContext.wasCorrect ? "CORRECTLY" : "INCORRECTLY"}${questionContext.correctAnswer ? `\nCorrect answer: ${questionContext.correctAnswer}` : ""}`
    : "";

  const scopeBlock = `\n\n## SCOPE OF PRACTICE\nThis student is an ${certLevel}. Only discuss interventions within ${certLevel} scope unless explicitly providing educational context about higher-level care.`;

  return `# ARIA — MedixPrep AI Tutor

You are ARIA (Adaptive Resuscitation Intelligence Assistant), the AI tutor for MedixPrep, the premier NREMT certification prep platform.

## CRITICAL RULES (NEVER VIOLATE)
1. NEVER generate drug doses, CPR parameters, or protocol steps from your own knowledge — ONLY use values from the VERIFIED PROTOCOL FACTS section
2. If protocol facts are not provided for a clinical value, say "Per current EMS protocols..." and direct them to their local protocol
3. NEVER recommend treatments outside ${certLevel} scope without explicit educational framing
4. If you are uncertain about a clinical fact, say so explicitly

## MODE: ${mode.toUpperCase()}
${modeInstructions}
${scopeBlock}
${factBlock}
${contextBlock}
${questionBlock}

Respond in markdown. Be educational, precise, and protocol-grounded.`;
}

export function buildGuardianSystemPrompt(): string {
  return `You are a clinical accuracy validator for an EMS education platform.

Your job is to check AI-generated responses for clinical errors that could harm students or patients.

Check for:
1. Wrong drug doses (e.g., incorrect mg amounts)
2. Wrong routes of administration (e.g., IV when only IM is in scope)
3. Wrong contraindications (e.g., stating something is safe when it's contraindicated)
4. Out-of-scope interventions presented as if they're within scope
5. Hallucinated protocols or guidelines
6. Statements contradicted by the provided protocol facts

Respond ONLY in this JSON format:
{
  "passed": boolean,
  "violations": [
    {
      "issueType": "wrong_dose|wrong_contraindication|out_of_scope|hallucinated_fact|unsupported_claim",
      "severity": "critical|warning|info",
      "description": "brief description",
      "correction": "correct information if known"
    }
  ],
  "correctedResponse": "full corrected response if critical violations found, null otherwise",
  "confidenceScore": 0.0-1.0,
  "notes": "brief summary"
}`;
}

export function buildScopeViolationResponse(topic: string, certLevel: CertLevel, minimumLevel: string): string {
  return `⚠️ **Scope Note**: ${topic} is typically performed at the **${minimumLevel}** level or above, which is above your current ${certLevel} scope.

I can explain the **concept** for educational awareness so you understand what's happening with your patient, but this is not something you would perform as an ${certLevel}.

Would you like me to explain:
1. The educational background on this procedure?
2. How to recognize when this intervention is needed so you can request ALS?
3. Your ${certLevel}-level response to this situation?`;
}

export function detectMode(message: string, history: Array<{ role: string }>): TutorMode {
  const lower = message.toLowerCase();

  if (lower.includes("quiz me") || lower.includes("test me") || lower.includes("question")) {
    return "quiz";
  }
  if (lower.includes("scenario") || lower.includes("debrief") || lower.includes("run")) {
    return "scenario_coach";
  }
  if (lower.includes("quick") || lower.includes("cram") || lower.includes("rapid fire") || lower.includes("just give me")) {
    return "cram";
  }
  if (lower.includes("explain") || lower.includes("why") || lower.includes("how does") || lower.includes("what is")) {
    return "explain";
  }
  if (history.length > 6) {
    return "chat"; // Long conversations default to chat
  }

  return "chat";
}
