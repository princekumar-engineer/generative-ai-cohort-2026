import { QdrantClient } from "@qdrant/js-client-rest";
import { config } from "./config.js";

export const qdrant = new QdrantClient({ url: config.qdrant.url });

/**
 * Create the collection if it doesn't already exist.
 * Vector size must match the embedding model's dimensions.
 */
export async function ensureCollection() {
  const name = config.qdrant.collection;
  const exists = await qdrant.collectionExists(name);

  if (!exists.exists) {
    try {
      await qdrant.createCollection(name, {
        vectors: {
          size: config.openai.embeddingDimensions,
          distance: "Cosine",
        },
      });
      console.log(`🗂️  Created Qdrant collection "${name}"`);
    } catch (err) {
      // Another concurrent worker may have created it first (409 Conflict).
      const stillMissing = !(await qdrant.collectionExists(name)).exists;
      if (stillMissing) throw err;
    }
  }

  return name;
}
