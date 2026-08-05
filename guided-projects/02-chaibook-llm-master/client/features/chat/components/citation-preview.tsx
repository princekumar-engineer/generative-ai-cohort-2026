"use client";

import Link from "next/link";
import {
    BookOpenIcon,
    ExternalLinkIcon,
    FileTextIcon,
    GlobeIcon,
    PlusIcon,
    VideoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImportWebSearchSource } from "@/features/sources/hooks/use-sources";
import { SOURCE_TYPE_LABELS } from "@/features/sources/lib/constants";
import type { SourceType } from "@/features/sources/lib/types";
import { sourceRoutes } from "@/features/sources/lib/routes";
import type { ChatCitation } from "../lib/types";

type CitationPreviewProps = {
    citation: ChatCitation;
    workspaceId: string;
    markerIndex?: number;
};

function SourceTypeIcon({ type }: { type: string }) {
    switch (type) {
        case "PDF":
            return <FileTextIcon className="size-3.5" />;
        case "WEBSITE":
            return <GlobeIcon className="size-3.5" />;
        case "YOUTUBE":
            return <VideoIcon className="size-3.5" />;
        default:
            return <BookOpenIcon className="size-3.5" />;
    }
}

export function CitationPreview({
    citation,
    workspaceId,
    markerIndex,
}: CitationPreviewProps) {
    const importWebSearch = useImportWebSearchSource(workspaceId);
    const sourceType =
        citation.sourceType in SOURCE_TYPE_LABELS
            ? SOURCE_TYPE_LABELS[citation.sourceType as SourceType]
            : citation.sourceType;
    const isWeb = citation.sourceType === "WEB" && citation.url;

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <SourceTypeIcon type={citation.sourceType} />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                        {markerIndex != null ? (
                            <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                                {markerIndex}
                            </span>
                        ) : null}
                        <p className="truncate font-medium leading-tight">
                            {citation.sourceTitle}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {sourceType}
                        {citation.page ? ` · Page ${citation.page}` : null}
                    </p>
                </div>
            </div>

            <p className="line-clamp-5 text-xs leading-relaxed text-muted-foreground">
                {citation.excerpt}
            </p>

            {isWeb ? (
                <div className="flex flex-wrap gap-2">
                    <a
                        href={citation.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
                    >
                        <ExternalLinkIcon className="size-3" />
                        Open link
                    </a>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={importWebSearch.isPending}
                        onClick={() =>
                            void importWebSearch.mutateAsync({
                                title: citation.sourceTitle,
                                content: citation.excerpt,
                                url: citation.url!,
                            })
                        }
                    >
                        <PlusIcon className="size-3" />
                        Save to library
                    </Button>
                </div>
            ) : citation.sourceId ? (
                <Link
                    href={sourceRoutes.detail(workspaceId, citation.sourceId)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                    <ExternalLinkIcon className="size-3" />
                    Open source
                </Link>
            ) : null}
        </div>
    );
}
