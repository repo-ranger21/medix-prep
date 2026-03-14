import { retrieveChunks, buildContextString, type RetrievedChunk } from "./retriever";

export type { RetrievedChunk };

export interface RagOptions {
  query: string;
  certLevel?: string | null;
  topicFilter?: string | null;
  maxChunks?: number;
}

export interface RagResult {
  contextString: string;
  chunkIds: string[];
  retrievalMs: number;
  totalChunksFound: number;
}

export async function ragPipeline(options: RagOptions): Promise<RagResult> {
  const { chunks, retrievalMs } = await retrieveChunks({
    query: options.query,
    certLevel: options.certLevel,
    topicFilter: options.topicFilter,
    maxChunks: options.maxChunks ?? 5,
  });

  return {
    contextString: buildContextString(chunks),
    chunkIds: chunks.map((c) => c.id),
    retrievalMs,
    totalChunksFound: chunks.length,
  };
}
