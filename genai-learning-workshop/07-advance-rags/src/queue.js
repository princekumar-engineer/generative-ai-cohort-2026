import { Queue } from "bullmq";
import { config, INDEXING_QUEUE, QUERY_QUEUE } from "./config.js";

// BullMQ needs `maxRetriesPerRequest: null` on the connection it uses.
export const connection = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
};

export const indexingQueue = new Queue(INDEXING_QUEUE, { connection });
export const queryQueue = new Queue(QUERY_QUEUE, { connection });

/**
 * Enqueue a job telling the worker to index an uploaded PDF.
 * @param {{ filePath: string, originalName: string, mimeType: string, size: number }} payload
 */
export async function enqueueIndexingJob(payload) {
  return indexingQueue.add("index-file", payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

/**
 * Enqueue a query job. Completed/failed jobs are kept for a while so the
 * client can poll GET /query/:id for the result.
 * @param {{ query: string }} payload
 */
export async function enqueueQueryJob(payload) {
  return queryQueue.add("run-query", payload, {
    attempts: 2,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 }, // keep 1h for polling
    removeOnFail: { age: 3600, count: 1000 },
  });
}
