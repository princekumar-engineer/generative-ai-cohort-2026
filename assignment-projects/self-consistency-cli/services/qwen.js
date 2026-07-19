import axios from "axios";
import dotenv from "dotenv";
import { AnswerSchema } from "../schemas/answerSchema.js";
dotenv.config();

const OPENROUTER_CONFIG = {
  baseURL: "https://openrouter.ai/api/v1",
  model: "qwen/qwen3-30b-a3b",
};

export async function askQwen(prompt) {
  try {
    const response = await axios.post(
      `${OPENROUTER_CONFIG.baseURL}/chat/completions`,
      {
        model: OPENROUTER_CONFIG.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
          "X-Title": "Self Consistency CLI",
        },
      }
    );

    // Validate the expected path exists before parsing
    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("API returned an empty response content.");
    }

    return AnswerSchema.parse({
      provider: "OpenRouter",
      model: "Qwen 3 30B A3B",
      answer: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Log meaningful context
    const errorMessage = err.response?.data?.error?.message || err.message;
    console.error("Qwen Error:", errorMessage);
    
    throw new Error(`Qwen API call failed: ${errorMessage}`);
  }
}