import { openai } from "@ai-sdk/openai";

/** Default OpenAI model used when a conversation has no model override. */
export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

/**
 * Returns an OpenAI language model instance for chat completions.
 *
 * @param modelId - Optional model identifier; falls back to {@link DEFAULT_CHAT_MODEL}.
 */
export function getChatModel(modelId?: string | null) {
    return openai(modelId || DEFAULT_CHAT_MODEL)
}