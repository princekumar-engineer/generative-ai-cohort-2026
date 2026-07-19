import { GoogleGenAI } from "@google/genai";
import { AnswerSchema } from "../schemas/answerSchema.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function askGemini(prompt) {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return AnswerSchema.parse({
      provider: "Google AI Studio",
      model: "Gemini 2.5 Flash",
      answer: res.text,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    throw new Error(err.response?.data?.error?.message || err.message);
  }
}
