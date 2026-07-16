import dotenv from 'dotenv';
dotenv.config();

import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function query(userQuery) {
  // COnvert user query to vector embeddings?
  // Initalize the embedding model
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY,
  });

  // search the vectors in the qdrant
  // The vector store
  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings, // Use this embedding model
    {
      url: 'http://localhost:6333',
      collectionName: 'chaicode-docs',
    },
  );

  // get simialr vectors and chunks?
  const vectorRetriver = vectorStore.asRetriever({ k: 5 });
  const results = await vectorRetriver.invoke(userQuery);

  // feed those chunks to llm model and do a simple chat with {userQuery}
  const SYSTEM_PROMPT = `
    You are an expert in answering user queries based on the provided context about the document.
    Do not answer anything beyond what is provided.

    Always answer the user briefly and mention the page number where the content is available, along with the name of the book.

    User Documents:
    ${results
      .map((e) =>
        JSON.stringify({
          bookName: e.metadata.source,
          pageContent: e.pageContent,
          pageNumber: e.metadata.loc.pageNumber,
        }),
      )
      .join('\n\n')}
  `;

  const llmResponse = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  console.log('LLM Response:', llmResponse.choices[0].message.content);
}

query('what is black box testing?').catch(console.error);