import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractRelevantFacts, checkScope, ALS_KEYWORDS } from "@/lib/protocol-engine";
import { ragPipeline } from "@/lib/rag";
import {
  selectModel,
  detectMode,
  buildSystemPrompt,
  buildScopeViolationResponse,
  runGuardian,
  resolveFinalResponse,
  writeAuditLog,
} from "@/lib/ai";
import type { TutorMessage } from "@/lib/ai/types";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { CertLevel } from "@/types/database.types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    // 1. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request
    const body = await request.json();
    const { message, conversationHistory = [], mode: requestedMode, questionContext } = body as {
      message: string;
      conversationHistory: TutorMessage[];
      mode?: string;
      questionContext?: {
        stem: string;
        topic: string;
        wasCorrect: boolean;
        correctAnswer?: string;
      };
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Load profile cert_level
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("cert_level")
      .eq("id", user.id)
      .single() as { data: { cert_level: CertLevel } | null };

    const certLevel: CertLevel = (profile?.cert_level as CertLevel) ?? "EMT";

    // 4. Scope check
    const messageLower = message.toLowerCase();
    const hasAlsKeyword = ALS_KEYWORDS.some((kw) => messageLower.includes(kw.toLowerCase()));

    if (hasAlsKeyword) {
      const scopeResult = checkScope(message, certLevel);
      if (!scopeResult.inScope && scopeResult.minimumLevel) {
        const violationResponse = buildScopeViolationResponse(
          message,
          certLevel,
          scopeResult.minimumLevel
        );
        return streamText(violationResponse);
      }
    }

    // 5. Protocol Engine facts
    const protocolFacts = extractRelevantFacts(message);

    // 6. RAG pipeline
    const ragResult = await ragPipeline({
      query: message,
      certLevel,
      maxChunks: 5,
    });

    // 7. Detect mode + select model
    const mode = (requestedMode as import("@/lib/ai/types").TutorMode) || detectMode(message, conversationHistory);
    const modelConfig = selectModel({
      mode,
      message,
      historyLength: conversationHistory.length,
    });

    // 8. Build system prompt
    const systemPrompt = buildSystemPrompt({
      mode,
      certLevel,
      protocolFacts,
      ragContext: ragResult.contextString,
      questionContext,
    });

    // 9. Generate full response first (for guardian)
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    let fullResponse = "";

    if (modelConfig.tier === "fast") {
      const completion = await openai.chat.completions.create({
        model: modelConfig.model,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      });
      fullResponse = completion.choices[0]?.message?.content ?? "";
    } else {
      // Anthropic Claude
      const completion = await anthropic.messages.create({
        model: modelConfig.model,
        max_tokens: modelConfig.maxTokens,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });
      const content = completion.content[0];
      fullResponse = content.type === "text" ? content.text : "";
    }

    // 10. Guardian validation
    const guardianResult = await runGuardian({
      responseText: fullResponse,
      certLevel,
      query: message,
      protocolFacts: protocolFacts.map((f) => ({ key: f.key, value: f.value })),
    });

    // 11. Resolve final response
    const { finalResponse, flagged } = resolveFinalResponse(fullResponse, guardianResult);

    const latencyMs = Date.now() - start;

    // 12. Async audit log (non-blocking)
    writeAuditLog({
      userId: user.id,
      certLevel,
      queryText: message,
      retrievedChunkIds: ragResult.chunkIds,
      modelUsed: modelConfig.model,
      responseText: finalResponse,
      confidenceScore: guardianResult.confidenceScore,
      guardianPassed: guardianResult.passed,
      guardianNotes: guardianResult.notes,
      latencyMs,
      flaggedForReview: flagged,
    }).catch(console.error);

    // 13. Stream pre-computed text as SSE
    return streamText(finalResponse);
  } catch (error) {
    console.error("Tutor API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function streamText(text: string): Response {
  const words = text.split(" ");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ word: word + " " })}\n\n`));
        await new Promise((r) => setTimeout(r, 10));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
