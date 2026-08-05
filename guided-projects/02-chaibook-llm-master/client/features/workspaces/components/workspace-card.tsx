"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getWorkspaceGradient } from "../lib/workspace-gradients";
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";

type WorkspaceCardProps = {
    workspace: Workspace;
    onEdit: (workspace: Workspace) => void;
    onDelete: (workspace: Workspace) => void;
    className?: string;
};

export function WorkspaceCard({
    workspace,
    onEdit,
    onDelete,
    className,
}: WorkspaceCardProps) {
    const href = workspaceRoutes.detail(workspace.id);
    const gradient = getWorkspaceGradient(workspace.id);

    return (
        <article
            className={cn(
                "group/card relative min-h-[196px] overflow-hidden rounded-3xl shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
                className,
            )}
        >
            <Link
                href={href}
                className={cn(
                    "absolute inset-0 z-0 rounded-3xl bg-linear-to-br focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    gradient,
                )}
                aria-label={`Open ${workspace.title}`}
            />

            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-white/10" />

            <div className="pointer-events-none relative flex h-full min-h-[196px] flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
                        {workspace.icon ?? "📚"}
                    </span>

                    <div
                        className="pointer-events-auto relative z-10"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        className="size-8 bg-black/15 text-white hover:bg-black/25 hover:text-white"
                                    />
                                }
                            >
                                <MoreHorizontalIcon />
                                <span className="sr-only">Open menu</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => onEdit(workspace)}
                                >
                                    <PencilIcon />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => onDelete(workspace)}
                                >
                                    <Trash2Icon />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="mt-auto space-y-1.5 pt-8 text-white">
                    <h3 className="line-clamp-2 font-heading text-lg font-semibold leading-snug drop-shadow-sm">
                        {workspace.title}
                    </h3>
                    {workspace.description ? (
                        <p className="line-clamp-2 text-sm text-white/85">
                            {workspace.description}
                        </p>
                    ) : null}
                    <p className="text-xs text-white/70">
                        Updated{" "}
                        {formatDistanceToNow(new Date(workspace.updatedAt), {
                            addSuffix: true,
                        })}
                    </p>
                </div>
            </div>
        </article>
    );
}
