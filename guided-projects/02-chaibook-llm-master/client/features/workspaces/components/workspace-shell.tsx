"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    GraduationCapIcon,
    MessageSquareIcon,
    PlusIcon,
    SettingsIcon,
} from "lucide-react";
import { learnRoutes } from "@/features/learn";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
    AddSourceDialog,
    SourceSidebarList,
    sourceRoutes,
} from "@/features/sources";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";
import { WorkspaceHeaderActions } from "./workspace-header-actions";

type WorkspaceShellProps = {
    workspace: Workspace;
    children: React.ReactNode;
};

export function WorkspaceShell({ workspace, children }: WorkspaceShellProps) {
    const pathname = usePathname();
    const [addSourceOpen, setAddSourceOpen] = useState(false);

    const sourcesPath = sourceRoutes.list(workspace.id);
    const learnPath = learnRoutes.hub(workspace.id);
    const isSourcesActive = pathname.startsWith(sourcesPath);
    const isLearnActive = pathname.startsWith(learnPath);
    const isChatActive =
        !isSourcesActive && !isLearnActive && !pathname.includes("/settings");
    const isSettingsActive = pathname.includes("/settings");

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader className="border-b border-sidebar-border">
                    <div className="flex items-center gap-2 px-2 py-1">
                        <span className="text-xl">{workspace.icon ?? "📚"}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                                {workspace.title}
                            </p>
                            {workspace.description ? (
                                <p className="truncate text-xs text-muted-foreground">
                                    {workspace.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isChatActive}
                                        render={
                                            <Link
                                                href={workspaceRoutes.detail(
                                                    workspace.id,
                                                )}
                                            />
                                        }
                                    >
                                        <MessageSquareIcon />
                                        <span>Chat</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isLearnActive}
                                        render={
                                            <Link href={learnPath} />
                                        }
                                    >
                                        <GraduationCapIcon />
                                        <span>Learn</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isSourcesActive}
                                        render={
                                            <Link href={sourcesPath} />
                                        }
                                    >
                                        <BookOpenIcon />
                                        <span>Sources</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        isActive={isSettingsActive}
                                        render={
                                            <Link
                                                href={workspaceRoutes.settings(
                                                    workspace.id,
                                                )}
                                            />
                                        }
                                    >
                                        <SettingsIcon />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SourceSidebarList
                        workspaceId={workspace.id}
                        onAddSource={() => setAddSourceOpen(true)}
                    />
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border">
                    <Button
                        nativeButton={false}
                        variant="ghost"
                        className="w-full justify-start"
                        render={<Link href={workspaceRoutes.list} />}
                    >
                        <ArrowLeftIcon />
                        All workspaces
                    </Button>
                </SidebarFooter>

                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 items-center gap-3 border-b px-4">
                    <SidebarTrigger />
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate font-heading text-base font-semibold">
                            {workspace.title}
                        </h1>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAddSourceOpen(true)}
                    >
                        <PlusIcon />
                        Add source
                    </Button>
                    <WorkspaceHeaderActions workspace={workspace} />
                    <SignOutButton />
                </header>

                <main className="flex min-h-0 flex-1 flex-col">{children}</main>
            </SidebarInset>

            <AddSourceDialog
                workspaceId={workspace.id}
                open={addSourceOpen}
                onOpenChange={setAddSourceOpen}
            />
        </SidebarProvider>
    );
}
