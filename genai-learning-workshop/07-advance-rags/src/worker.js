import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { INDEXING_QUEUE, QUERY_QUEUE } from "./config.js";
import { indexPdf } from "./indexer.js";
import { answerQuery } from "./retriever.js";

// Worker that consumes indexing jobs enqueued by the /index route and runs the
// pipeline: parse PDF -> chunk -> embed (OpenAI) -> upsert into Qdrant.
const indexingWorker = new Worker(
  INDEXING_QUEUE,
  async (job) => {
    console.log(`📥 Indexing job ${job.id}: ${job.data.originalName}`);

    const result = await indexPdf({
      filePath: job.data.filePath,
      originalName: job.data.originalName,
    });

    console.log(`   → ${result.chunks} chunk(s) indexed`);
    return result;
  },
  { connection, concurrency: 2 }
);

// Worker that consumes query jobs enqueued by the /query route and runs the
// RAG pipeline: embed query -> search Qdrant -> generate an answer.
const queryWorker = new Worker(
  QUERY_QUEUE,
  async (job) => {
    console.log(`🔎 Query job ${job.id}: ${JSON.stringify(job.data.query)}`);
    const result = await answerQuery(job.data.query);
    console.log(`   → answered using ${result.sources.length} chunk(s)`);
    return result;
  },
  { connection, concurrency: 4 }
);

for (const [name, worker] of [
  ["indexing", indexingWorker],
  ["query", queryWorker],
]) {
  worker.on("completed", (job) => console.log(`✅ [${name}] job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`❌ [${name}] job ${job?.id} failed:`, err.message));
}

console.log("👷 Workers started (indexing + query). Waiting for jobs...");
