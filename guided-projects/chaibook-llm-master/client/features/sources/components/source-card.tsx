"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontalIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SOURCE_TYPE_LABELS } from "../lib/constants";
import { sourceRoutes } from "../lib/routes";
import type { Source } from "../lib/types";
import { SourceStatusBadge } from "./source-status-badge";
import { SourceTypeIcon } from "./source-type-icon";
import { cn } from "@/lib/utils";

type SourceCardProps = {
    source: Source;
    onDelete?: (source: Source) => void;
    onReprocess?: (source: Source) => void;
    className?: string;
};

export function SourceCard({
    source,
    onDelete,
    onReprocess,
    className,
}: SourceCardProps) {
    const href = sourceRoutes.detail(source.workspaceId, source.id);

    return (
        <Card className={cn("group/card relative transition-shadow hover:shadow-md", className)}>
            <Link
                href={href}
                className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Open ${source.title}`}
            />

            <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <SourceTypeIcon type={source.type} className="mt-0.5" />
                        <div className="min-w-0 space-y-1">
                            <CardTitle className="truncate group-hover/card:underline">
                                {source.title}
                            </CardTitle>
                            <CardDescription className="flex flex-wrap items-center gap-2">
                                <span>{SOURCE_TYPE_LABELS[source.type]}</span>
                                <span>·</span>
                                <span>
                                    {formatDistanceToNow(
                                        new Date(source.createdAt),
                                        { addSuffix: true },
                                    )}
                                </span>
                            </CardDescription>
                        </div>
                    </div>

                    {onDelete || onReprocess ? (
                        <div
                            className="relative z-10"
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={(event) => event.stopPropagation()}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="shrink-0"
                                        />
                                    }
                                >
                                    <MoreHorizontalIcon />
                                    <span className="sr-only">Open menu</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {onReprocess ? (
                                        <DropdownMenuItem
                                            onClick={() => onReprocess(source)}
                                        >
                                            <RefreshCwIcon />
                                            Reprocess
                                        </DropdownMenuItem>
                                    ) : null}
                                    {onDelete ? (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(source)}
                                        >
                                            <Trash2Icon />
                                            Delete
                                        </DropdownMenuItem>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : null}
                </div>
            </CardHeader>

            <CardContent className="relative flex items-center justify-between gap-3">
                <SourceStatusBadge status={source.status} />
                {source.content ? (
                    <p className="line-clamp-1 min-w-0 flex-1 text-right text-xs text-muted-foreground">
                        {source.content.slice(0, 120)}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
