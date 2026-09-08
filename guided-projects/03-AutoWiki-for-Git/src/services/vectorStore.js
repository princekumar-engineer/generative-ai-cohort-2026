import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
const pinecone = new Pinecone();

function getIndex() {
  return pinecone.Index(process.env.PINECONE_INDEX || "repo-chat");
}

export async function saveChunks(repo, documents) {
  const namespace = repo.replace("/", "-");

  await PineconeStore.fromDocuments(documents, embeddings, {
    pineconeIndex: getIndex(),
    namespace,
  });
}

export async function search(repo, question) {
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: getIndex(),
    namespace: repo.replace("/", "-"),
  });

  return store.similaritySearch(question, 5);
}
