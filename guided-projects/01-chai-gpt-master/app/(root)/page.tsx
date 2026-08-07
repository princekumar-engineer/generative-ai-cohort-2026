import { redirect } from "next/navigation";

import { startNewChat } from "@/features/home/actions/start-new-chat";

/** Start a fresh chat, then open it. */
export default async function HomePage() {
  const conversationId = await startNewChat();

  redirect(`/c/${conversationId}`);
}
