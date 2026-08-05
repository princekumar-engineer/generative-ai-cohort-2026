import {
    FileTextIcon,
    GlobeIcon,
    NotebookPenIcon,
    TypeIcon,
    VideoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SourceType } from "../lib/types";

const iconMap = {
    PDF: FileTextIcon,
    WEBSITE: GlobeIcon,
    YOUTUBE: VideoIcon,
    TEXT: TypeIcon,
    MARKDOWN: NotebookPenIcon,
} as const;

type SourceTypeIconProps = {
    type: SourceType;
    className?: string;
};

export function SourceTypeIcon({ type, className }: SourceTypeIconProps) {
    const Icon = iconMap[type];
    return <Icon className={cn("size-4 shrink-0", className)} />;
}
