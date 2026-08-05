import { openai } from "@ai-sdk/openai";

/** OpenAI model id used for chat (via @ai-sdk/openai + OPENAI_API_KEY). */
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

export function getChatModel(modelId?: string | null) {
  return openai(modelId || DEFAULT_CHAT_MODEL);
}
