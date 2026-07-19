import axios from "axios";
import dotenv from "dotenv";
import { AnswerSchema } from "../schemas/answerSchema.js";
dotenv.config();

// Configuration should be handled externally or via constants
const OPENROUTER_CONFIG = {
  baseURL: "https://openrouter.ai/api/v1",
  model: "meta-llama/llama-3.3-70b-instruct:free",
};

export async function askLlama(prompt) {
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
      model: "Llama 3.3 70B Instruct",
      answer: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // Log meaningful context
    const errorMessage = err.response?.data?.error?.message || err.message;
    console.error("Llama Error:", errorMessage);
    
    throw new Error(`Llama API call failed: ${errorMessage}`);
  }
}