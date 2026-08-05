import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 8000,
  redis: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  qdrant: {
    url: process.env.QDRANT_URL || "http://127.0.0.1:6333",
    collection: process.env.QDRANT_COLLECTION || "documents",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    // text-embedding-3-small -> 1536 dims, text-embedding-3-large -> 3072 dims
    embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    embeddingDimensions: Number(process.env.EMBEDDING_DIMENSIONS) || 1536,
    chatModel: process.env.CHAT_MODEL || "gpt-4o-mini",
  },
  chunking: {
    chunkSize: Number(process.env.CHUNK_SIZE) || 1000,
    chunkOverlap: Number(process.env.CHUNK_OVERLAP) || 200,
  },
  retrieval: {
    topK: Number(process.env.RETRIEVAL_TOP_K) || 4, // per-query candidates from Qdrant
    rrfK: Number(process.env.RRF_K) || 60, // Reciprocal Rank Fusion constant
    finalK: Number(process.env.RETRIEVAL_FINAL_K) || 5, // docs kept after fusion
  },
};

// Names of the BullMQ queues.
export const INDEXING_QUEUE = "file-indexing";
export const QUERY_QUEUE = "query";
