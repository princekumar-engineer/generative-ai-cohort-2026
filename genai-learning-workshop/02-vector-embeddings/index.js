import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const text = "dog chases cat";

async function generateEmbedding() {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    console.log("Vector Embeddings:", response);

    // Number of dimensions in the embedding vector
    console.log(
      "Length:",
      response.embeddings[0].values.length
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

generateEmbedding();