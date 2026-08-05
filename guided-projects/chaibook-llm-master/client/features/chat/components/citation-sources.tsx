"use client";

import Link from "next/link";
import {
    BookOpenIcon,
    FileTextIcon,
    GlobeIcon,
    VideoIcon,
} from "lucide-react";
import {
    Attachment,
    AttachmentContent,
    AttachmentDescription,
    AttachmentGroup,
    AttachmentMedia,
    AttachmentTitle,
    AttachmentTrigger,
} from "@/components/ui/attachment";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    Marker,
    MarkerContent,
    MarkerIcon,
} from "@/components/ui/marker";
import { SOURCE_TYPE_LABELS } from "@/features/sources/lib/constants";
import type { SourceType } from "@/features/sources/lib/types";
import { sourceRoutes } from "@/features/sources/lib/routes";
import { uniqueCitationsBySource } from "../lib/citations";
import type { ChatCitation } from "../lib/types";
import { CitationPreview } from "./citation-preview";

type CitationSourcesProps = {
    workspaceId: string;
    citations: ChatCitation[];
};

function SourceTypeIcon({ type }: { type: string }) {
    switch (type) {
        case "PDF":
            return <FileTextIcon />;
        case "WEBSITE":
            return <GlobeIcon />;
        case "YOUTUBE":
            return <VideoIcon />;
        default:
            return <BookOpenIcon />;
    }
}

function sourceTypeLabel(type: string) {
    return type in SOURCE_TYPE_LABELS
        ? SOURCE_TYPE_LABELS[type as SourceType]
        : type;
}

export function CitationSources({
    workspaceId,
    citations,
}: CitationSourcesProps) {
    const unique = uniqueCitationsBySource(citations);

    if (unique.length === 0) {
        return null;
    }

    return (
        <div className="flex w-full min-w-0 flex-col gap-2">
            <Marker variant="separator" className="text-xs">
                <MarkerIcon aria-hidden="true">
                    <BookOpenIcon />
                </MarkerIcon>
                <MarkerContent>Sources</MarkerContent>
            </Marker>

            <AttachmentGroup className="px-0.5">
                {unique.map((citation) => {
                    const description = [
                        citation.sourceType === "WEB"
                            ? "Web"
                            : sourceTypeLabel(citation.sourceType),
                        citation.page ? `p.${citation.page}` : null,
                    ]
                        .filter(Boolean)
                        .join(" · ");
                    const citationKey =
                        citation.sourceId ??
                        citation.url ??
                        citation.sourceTitle;
                    const isWeb = citation.sourceType === "WEB" && citation.url;

                    return (
                        <HoverCard key={citationKey}>
                            <HoverCardTrigger
                                delay={150}
                                closeDelay={100}
                                className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                            >
                                <Attachment
                                    size="xs"
                                    className="cursor-default transition-shadow hover:shadow-sm"
                                >
                                    <AttachmentMedia variant="icon">
                                        <SourceTypeIcon
                                            type={
                                                citation.sourceType === "WEB"
                                                    ? "WEBSITE"
                                                    : citation.sourceType
                                            }
                                        />
                                    </AttachmentMedia>
                                    <AttachmentContent>
                                        <AttachmentTitle>
                                            {citation.sourceTitle}
                                        </AttachmentTitle>
                                        {description ? (
                                            <AttachmentDescription>
                                                {description}
                                            </AttachmentDescription>
                                        ) : null}
                                    </AttachmentContent>
                                    {isWeb ? (
                                        <AttachmentTrigger
                                            render={
                                                <a
                                                    href={citation.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                />
                                            }
                                        />
                                    ) : citation.sourceId ? (
                                        <AttachmentTrigger
                                            render={
                                                <Link
                                                    href={sourceRoutes.detail(
                                                        workspaceId,
                                                        citation.sourceId,
                                                    )}
                                                />
                                            }
                                        />
                                    ) : null}
                                </Attachment>
                            </HoverCardTrigger>
                            <HoverCardContent
                                side="top"
                                align="start"
                                className="w-80"
                            >
                                <CitationPreview
                                    citation={citation}
                                    workspaceId={workspaceId}
                                />
                            </HoverCardContent>
                        </HoverCard>
                    );
                })}
            </AttachmentGroup>
        </div>
    );
}
