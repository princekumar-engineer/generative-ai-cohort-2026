import { ChatOpenAI } from "@langchain/openai";
import { search } from "./vectorStore.js";

function toText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part.text ?? ""))
      .join("");
  }
  return String(content ?? "");
}

export async function askQuestion(repo, question) {
  const docs = await search(repo, question);

  const context = docs
    .map((doc) => `File: ${doc.metadata.path}\n${doc.pageContent}`)
    .join("\n\n");

  const llm = new ChatOpenAI({ model: "gpt-4o-mini" });
  const response = await llm.invoke(
    `Answer using this repo context only.\n\n${context}\n\nQuestion: ${question}`,
  );

  return {
    answer: toText(response.content),
    sources: [...new Set(docs.map((doc) => doc.metadata.path))],
  };
}
