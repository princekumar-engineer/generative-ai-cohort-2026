import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { auth } from "@clerk/nextjs/server";

import { getChatModel } from "@/features/ai/utils/models";
import { requireUser } from "@/features/auth/actions/require-user";
import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { prisma } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  await auth.protect();

  const { message, id }: { message: UIMessage; id: string } = await req.json();

  if (!message || !id) {
    return new Response("Missing message or conversation id", { status: 400 });
  }

  const user = await requireUser();
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: user.id },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const previousMessages = await loadChatMessages(id);
  const alreadySaved = previousMessages.some(
    (storedMessage) => storedMessage.id === message.id
  );
  const messages = alreadySaved
    ? previousMessages
    : [...previousMessages, message];

  if (!alreadySaved) {
    await saveChatMessages(id, [message]);
  }

  const result = streamText({
    model: getChatModel(conversation.model),
    system: conversation.systemPrompt ?? "You are ChaiGPT, a helpful assistant.",
    messages: await convertToModelMessages(messages),
  });

  // Keep saving even if the browser disconnects mid-stream.
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onEnd: async ({ messages: finalMessages }) => {
        try {
          await saveChatMessages(id, finalMessages, { updateTitle: false });
        } catch (error) {
          console.error("Failed to save chat messages", error);
        }
      },
    }),
  });
}
