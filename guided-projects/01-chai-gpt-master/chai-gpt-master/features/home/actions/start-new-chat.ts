"use server";

import { requireUser } from "@/features/auth/actions/require-user";
import { prisma } from "@/lib/db";

/** Create a fresh, empty chat for the current user and return its id. */
export async function startNewChat() {
  const user = await requireUser();

  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: "New Chat",
    },
  });

  return conversation.id;
}
