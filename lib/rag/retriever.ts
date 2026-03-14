import { embedQuery } from "./embedder";
import { createClient } from "@/lib/supabase/server";
import { cosineSimilarity } from "./embedder";

export interface RetrievedChunk {
  id: string;
  content: string;
  source: string;
  cert_level: string | null;
  topic_category: string | null;
  recommendation_class: string | null;
  evidence_level: string | null;
  keywords: string[] | null;
  chunk_index: number;
  similarity: number;
}

const EMS_SYNONYMS: Record<string, string[]> = {
  epi: ["epinephrine", "adrenaline"],
  narcan: ["naloxone"],
  nitro: ["nitroglycerin", "NTG"],
  ntg: ["nitroglycerin"],
  defib: ["defibrillation", "defibrillator", "AED"],
  cpr: ["cardiopulmonary resuscitation", "chest compressions"],
  rosc: ["return of spontaneous circulation"],
  vf: ["ventricular fibrillation"],
  pvt: ["pulseless ventricular tachycardia"],
  pea: ["pulseless electrical activity"],
  als: ["advanced life support"],
  bls: ["basic life support"],
  ems: ["emergency medical services"],
};

export function augmentQuery(query: string): string {
  let augmented = query;
  const lower = query.toLowerCase();

  for (const [abbreviation, expansions] of Object.entries(EMS_SYNONYMS)) {
    if (lower.includes(abbreviation)) {
      augmented += ` ${expansions.join(" ")}`;
    }
  }

  return augmented.trim();
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / (union.size + 1e-10);
}

export function mmrRerank(
  chunks: RetrievedChunk[],
  queryEmbedding: number[],
  lambda: number = 0.6,
  topK: number = 5
): RetrievedChunk[] {
  if (chunks.length === 0) return [];

  const selected: RetrievedChunk[] = [];
  const remaining = [...chunks];

  while (selected.length < topK && remaining.length > 0) {
    let bestScore = -Infinity;
    let bestIdx = 0;

    for (let i = 0; i < remaining.length; i++) {
      const relevance = remaining[i].similarity;
      let maxSimilarityToSelected = 0;

      for (const s of selected) {
        const sim = jaccardSimilarity(remaining[i].content, s.content);
        maxSimilarityToSelected = Math.max(maxSimilarityToSelected, sim);
      }

      const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarityToSelected;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIdx = i;
      }
    }

    selected.push(remaining[bestIdx]);
    remaining.splice(bestIdx, 1);
  }

  return selected;
}

export async function retrieveChunks(options: {
  query: string;
  certLevel?: string | null;
  topicFilter?: string | null;
  maxChunks?: number;
  semanticWeight?: number;
  keywordWeight?: number;
}): Promise<{ chunks: RetrievedChunk[]; retrievalMs: number }> {
  const {
    query,
    certLevel,
    topicFilter,
    maxChunks = 8,
    semanticWeight = 0.7,
    keywordWeight = 0.3,
  } = options;

  const start = Date.now();
  const augmented = augmentQuery(query);
  const embedding = await embedQuery(augmented);

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("hybrid_search_guidelines", {
    query_embedding: embedding,
    query_text: augmented,
    filter_cert: certLevel ?? null,
    filter_topic: topicFilter ?? null,
    match_count: maxChunks * 2, // fetch more for MMR
    semantic_weight: semanticWeight,
    keyword_weight: keywordWeight,
  });

  if (error) {
    console.error("RAG retrieval error:", error);
    return { chunks: [], retrievalMs: Date.now() - start };
  }

  const chunks = (data as RetrievedChunk[]) ?? [];
  const reranked = mmrRerank(chunks, embedding, 0.6, maxChunks);

  return { chunks: reranked, retrievalMs: Date.now() - start };
}

export async function retrieveMultiQuery(
  queries: string[],
  options: Omit<Parameters<typeof retrieveChunks>[0], "query"> & { maxChunks?: number }
): Promise<{ chunks: RetrievedChunk[]; retrievalMs: number }> {
  const start = Date.now();
  const results = await Promise.all(
    queries.map((q) => retrieveChunks({ ...options, query: q }))
  );

  // Deduplicate by id, keep highest similarity
  const seen = new Map<string, RetrievedChunk>();
  for (const result of results) {
    for (const chunk of result.chunks) {
      const existing = seen.get(chunk.id);
      if (!existing || chunk.similarity > existing.similarity) {
        seen.set(chunk.id, chunk);
      }
    }
  }

  const all = Array.from(seen.values()).sort((a, b) => b.similarity - a.similarity);
  return { chunks: all.slice(0, options.maxChunks ?? 5), retrievalMs: Date.now() - start };
}

export function buildContextString(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  return chunks
    .map((chunk, i) => {
      const meta: string[] = [`Source: ${chunk.source}`];
      if (chunk.cert_level) meta.push(`Cert Level: ${chunk.cert_level}`);
      if (chunk.topic_category) meta.push(`Topic: ${chunk.topic_category}`);
      if (chunk.recommendation_class) meta.push(`AHA Class: ${chunk.recommendation_class}`);
      if (chunk.evidence_level) meta.push(`Evidence: ${chunk.evidence_level}`);
      return `[Context ${i + 1}] ${meta.join(" | ")}\n${chunk.content}`;
    })
    .join("\n\n---\n\n");
}
