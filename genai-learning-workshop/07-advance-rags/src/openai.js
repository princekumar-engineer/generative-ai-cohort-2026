import OpenAI from "openai";
import { config } from "./config.js";

// Shared OpenAI client used for both embeddings and chat completions.
export const openai = new OpenAI({ apiKey: config.openai.apiKey });

/** Create an embedding vector for a single piece of text. */
export async function embedText(text) {
  const res = await openai.embeddings.create({
    model: config.openai.embeddingModel,
    input: text,
  });
  return res.data[0].embedding;
}

/** Create embeddings for many texts (batched to stay within limits). */
export async function embedTexts(texts, batchSize = 100) {
  const vectors = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const res = await openai.embeddings.create({
      model: config.openai.embeddingModel,
      input: batch,
    });
    for (const item of res.data) vectors.push(item.embedding);
  }
  return vectors;
}
