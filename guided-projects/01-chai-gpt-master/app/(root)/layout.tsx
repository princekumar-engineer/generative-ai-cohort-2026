import { auth } from "@clerk/nextjs/server";
import { onBoard } from "@/features/auth/actions/onboard";
import { ChatShell } from "@/features/conversation/components/chat-shell";

export default async function RootGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();
  await onBoard();

  return <ChatShell>{children}</ChatShell>;
}
