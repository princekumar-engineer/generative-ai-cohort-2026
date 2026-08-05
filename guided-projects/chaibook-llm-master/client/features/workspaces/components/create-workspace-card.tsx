"use client";

import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type CreateWorkspaceCardProps = {
    onClick: () => void;
    className?: string;
};

export function CreateWorkspaceCard({
    onClick,
    className,
}: CreateWorkspaceCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "group flex min-h-[196px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/80 bg-card/50 p-6 text-center transition-all hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className,
            )}
        >
            <span className="flex size-12 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                <PlusIcon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </span>
            <div className="space-y-1">
                <p className="font-medium">Create notebook</p>
                <p className="text-xs text-muted-foreground">
                    Upload sources and start chatting
                </p>
            </div>
        </button>
    );
}
