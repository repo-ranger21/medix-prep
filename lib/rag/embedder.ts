import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMS = 1536;
const COST_PER_MILLION_TOKENS = 0.02;

// In-memory query cache (5min TTL)
const queryCache = new Map<string, { embedding: number[]; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vectors must have same dimension");
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

async function embedWithRetry(text: string, retries = 3): Promise<number[]> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
        dimensions: EMBEDDING_DIMS,
      });
      return response.data[0].embedding;
    } catch (error) {
      if (attempt === retries - 1) throw error;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error("Embedding failed after retries");
}

export async function embedQuery(text: string): Promise<number[]> {
  const cacheKey = text.trim().toLowerCase();
  const cached = queryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.embedding;
  }

  const embedding = await embedWithRetry(text);
  queryCache.set(cacheKey, { embedding, expiresAt: Date.now() + CACHE_TTL_MS });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 100;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMS,
    });
    results.push(...response.data.map((d) => d.embedding));
    // Small delay between batches
    if (i + BATCH_SIZE < texts.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  return results;
}

export function estimateEmbeddingCost(tokenCount: number): number {
  return (tokenCount / 1_000_000) * COST_PER_MILLION_TOKENS;
}

export { EMBEDDING_DIMS };
