import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function chunkFiles(files, repo) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  const documents = [];

  for (const file of files) {
    const chunks = await splitter.createDocuments(
      [file.content],
      [{ path: file.path, repo }],
    );
    documents.push(...chunks);
  }

  return documents;
}
