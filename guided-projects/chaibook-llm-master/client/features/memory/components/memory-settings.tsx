"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
    ArrowLeftIcon,
    BrainIcon,
    PencilIcon,
    PlusIcon,
    Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import {
    useCreateMemory,
    useDeleteMemory,
    useMemories,
    useUpdateMemory,
} from "../hooks/use-memories";
import type { UserMemory } from "../lib/types";
import { MemoryFormDialog } from "./memory-form-dialog";

export function MemorySettings() {
    const { data: memories = [], isLoading, error } = useMemories();
    const createMemory = useCreateMemory();
    const updateMemory = useUpdateMemory();
    const deleteMemory = useDeleteMemory();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMemory, setEditingMemory] = useState<UserMemory | null>(
        null,
    );

    function openCreateDialog() {
        setEditingMemory(null);
        setDialogOpen(true);
    }

    function openEditDialog(memory: UserMemory) {
        setEditingMemory(memory);
        setDialogOpen(true);
    }

    async function handleSubmit(values: { memory: string }) {
        if (editingMemory) {
            await updateMemory.mutateAsync({
                memoryId: editingMemory.id,
                input: values,
            });
            return;
        }

        await createMemory.mutateAsync(values);
    }

    return (
        <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                    <Button
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                        className="-ml-2"
                        render={<Link href={workspaceRoutes.list} />}
                    >
                        <ArrowLeftIcon />
                        Dashboard
                    </Button>
                    <div className="flex items-center gap-2">
                        <BrainIcon className="size-5" />
                        <h1 className="font-heading text-2xl font-semibold">
                            Memory
                        </h1>
                    </div>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Powered by Mem0. Chaibook learns stable facts from your
                        chats and uses semantic search to recall them in future
                        conversations.
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <PlusIcon />
                    Add memory
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-24 rounded-3xl" />
                    <Skeleton className="h-24 rounded-3xl" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Could not load memories from Mem0.
                </div>
            ) : memories.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center">
                    <p className="font-medium">No memories yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Chat for a while and Mem0 will extract preferences and
                        context, or add a memory manually.
                    </p>
                    <Button className="mt-4" onClick={openCreateDialog}>
                        <PlusIcon />
                        Add memory
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {memories.map((memory) => (
                        <div
                            key={memory.id}
                            className="rounded-3xl border bg-card p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">
                                            {memory.source === "manual"
                                                ? "Manual"
                                                : "Learned"}
                                        </Badge>
                                        {memory.categories?.map((category) => (
                                            <Badge
                                                key={category}
                                                variant="outline"
                                            >
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm">{memory.memory}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Updated{" "}
                                        {formatDistanceToNow(
                                            new Date(memory.updatedAt),
                                            { addSuffix: true },
                                        )}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => openEditDialog(memory)}
                                    >
                                        <PencilIcon />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() =>
                                            void deleteMemory.mutateAsync(
                                                memory.id,
                                            )
                                        }
                                        disabled={deleteMemory.isPending}
                                    >
                                        <Trash2Icon />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MemoryFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                memory={editingMemory}
                onSubmit={handleSubmit}
                isPending={
                    createMemory.isPending || updateMemory.isPending
                }
            />
        </div>
    );
}
