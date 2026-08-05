"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/shared/lib/api";
import {
    useCreateWorkspace,
    useDeleteWorkspace,
    useUpdateWorkspace,
    useWorkspaces,
} from "../hooks/use-workspaces";
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { WorkspaceCard } from "./workspace-card";
import { WorkspaceFormDialog } from "./workspace-form-dialog";

export function WorkspaceList() {
    const router = useRouter();
    const { data: workspaces, isLoading, error } = useWorkspaces();
    const createWorkspace = useCreateWorkspace();

    const [createOpen, setCreateOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
        null,
    );
    const [deletingWorkspace, setDeletingWorkspace] =
        useState<Workspace | null>(null);

    const updateWorkspace = useUpdateWorkspace(editingWorkspace?.id ?? "");
    const deleteWorkspace = useDeleteWorkspace();

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-36 rounded-[24px]" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Empty className="border">
                <EmptyHeader>
                    <EmptyTitle>Could not load workspaces</EmptyTitle>
                    <EmptyDescription>
                        {error instanceof ApiError
                            ? error.message
                            : "Please try again in a moment."}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-heading text-lg font-semibold">
                        Your workspaces
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Create notebooks to organize sources and chats.
                    </p>
                </div>
                <Button onClick={() => setCreateOpen(true)}>
                    <PlusIcon />
                    New workspace
                </Button>
            </div>

            {workspaces && workspaces.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {workspaces.map((workspace) => (
                        <WorkspaceCard
                            key={workspace.id}
                            workspace={workspace}
                            onEdit={setEditingWorkspace}
                            onDelete={setDeletingWorkspace}
                        />
                    ))}
                </div>
            ) : (
                <Empty className="mt-6 border">
                    <EmptyHeader>
                        <EmptyTitle>No workspaces yet</EmptyTitle>
                        <EmptyDescription>
                            Create your first notebook to get started with
                            Chaibook.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => setCreateOpen(true)}>
                            <PlusIcon />
                            Create workspace
                        </Button>
                    </EmptyContent>
                </Empty>
            )}

            <WorkspaceFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                isPending={createWorkspace.isPending}
                onSubmit={async (values) => {
                    const workspace = await createWorkspace.mutateAsync(values);
                    router.push(workspaceRoutes.detail(workspace.id));
                }}
            />

            <WorkspaceFormDialog
                open={Boolean(editingWorkspace)}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingWorkspace(null);
                    }
                }}
                workspace={editingWorkspace}
                isPending={updateWorkspace.isPending}
                onSubmit={async (values) => {
                    await updateWorkspace.mutateAsync(values);
                    setEditingWorkspace(null);
                }}
            />

            <DeleteWorkspaceDialog
                workspace={deletingWorkspace}
                open={Boolean(deletingWorkspace)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingWorkspace(null);
                    }
                }}
                isPending={deleteWorkspace.isPending}
                onConfirm={async () => {
                    if (!deletingWorkspace) {
                        return;
                    }

                    await deleteWorkspace.mutateAsync(deletingWorkspace.id);
                    setDeletingWorkspace(null);
                }}
            />
        </>
    );
}
