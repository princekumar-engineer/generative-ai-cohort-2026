"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { GraduationCapIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ARTIFACT_TYPE_LABELS } from "../lib/constants";
import { learnRoutes } from "../lib/routes";
import { useArtifacts, useDeleteArtifact } from "../hooks/use-artifacts";
import {
    ArtifactStatusBadge,
    ArtifactTypeBadge,
} from "./artifact-status-badge";
import { GenerateArtifactDialog } from "./generate-artifact-dialog";
import { useState } from "react";

type LearnHubProps = {
    workspaceId: string;
};

export function LearnHub({ workspaceId }: LearnHubProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data: artifacts = [], isLoading, error } = useArtifacts(workspaceId);
    const deleteArtifact = useDeleteArtifact(workspaceId);

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <GraduationCapIcon className="size-5" />
                        <h2 className="font-heading text-xl font-semibold">
                            Learning tools
                        </h2>
                    </div>
                    <p className="max-w-xl text-sm text-muted-foreground">
                        Generate summaries, flashcards, quizzes, mind maps, and
                        reports from your indexed sources.
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusIcon />
                    Generate
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
            ) : error ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Could not load learning tools.
                </div>
            ) : artifacts.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center">
                    <p className="font-medium">No learning tools yet</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Generate your first summary, quiz, or flashcard deck
                        from workspace sources.
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => setDialogOpen(true)}
                    >
                        <PlusIcon />
                        Generate
                    </Button>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {artifacts.map((artifact) => (
                        <div
                            key={artifact.id}
                            className="group relative rounded-3xl border bg-card p-4 transition-colors hover:bg-muted/20"
                        >
                            <Link
                                href={learnRoutes.detail(
                                    workspaceId,
                                    artifact.id,
                                )}
                                className="block space-y-3"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <ArtifactTypeBadge type={artifact.type} />
                                    <ArtifactStatusBadge
                                        status={artifact.status}
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">{artifact.title}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {ARTIFACT_TYPE_LABELS[artifact.type]} ·{" "}
                                        {formatDistanceToNow(
                                            new Date(artifact.createdAt),
                                            { addSuffix: true },
                                        )}
                                    </p>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() =>
                                    void deleteArtifact.mutateAsync(artifact.id)
                                }
                                disabled={deleteArtifact.isPending}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <GenerateArtifactDialog
                workspaceId={workspaceId}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
