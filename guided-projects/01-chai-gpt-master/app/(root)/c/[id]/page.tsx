import { notFound } from "next/navigation";

import { ConversationView } from "@/features/messages/components/conversation-view";
import { loadChatMessages } from "@/features/ai/actions/chat-store";
import { getConversation } from "@/features/conversation/actions/conversation-actions";

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { id } = await params;

  try {
    await getConversation(id);
  } catch {
    notFound();
  }

  const initialMessages = await loadChatMessages(id);

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={initialMessages}
    />
  );
}
