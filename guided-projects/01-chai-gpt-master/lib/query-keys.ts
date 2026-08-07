/**
 * Central place for all TanStack Query keys.
 *
 * Why? Keys must stay consistent between useQuery and invalidateQueries.
 * Using a factory like this avoids typos like ["conversation"] vs ["conversations"].
 *
 * Pattern:
 *   queryKeys.conversations.all        → list cache
 *   queryKeys.conversations.detail(id) → one conversation
 *   queryKeys.messages.byConversation(id) → messages in a chat
 */
export const queryKeys = {
  conversations: {
    all: ["conversations"] as const,
    detail: (id: string) => ["conversations", id] as const,
  },
  messages: {
    byConversation: (conversationId: string) =>
      ["messages", conversationId] as const,
  },
};
