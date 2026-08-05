import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SOURCE_STATUS_LABELS } from "../lib/constants";
import type { SourceStatus } from "../lib/types";

const statusVariant: Record<
    SourceStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    PENDING: "secondary",
    PROCESSING: "outline",
    READY: "default",
    FAILED: "destructive",
};

type SourceStatusBadgeProps = {
    status: SourceStatus;
    className?: string;
};

export function SourceStatusBadge({ status, className }: SourceStatusBadgeProps) {
    return (
        <Badge
            variant={statusVariant[status]}
            className={cn("capitalize", className)}
        >
            {SOURCE_STATUS_LABELS[status]}
        </Badge>
    );
}
