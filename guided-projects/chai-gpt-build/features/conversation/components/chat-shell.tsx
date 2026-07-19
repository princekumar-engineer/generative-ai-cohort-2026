"use client";

import { AppSidebar } from "@/features/conversation/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * App shell with collapsible sidebar and main content area for chat views.
 */
export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-svh overflow-hidden">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
