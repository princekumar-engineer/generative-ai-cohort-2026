import { Badge } from "@/components/ui/badge";
import { ARTIFACT_STATUS_LABELS, ARTIFACT_TYPE_LABELS } from "../lib/constants";
import type { ArtifactStatus, ArtifactType } from "../lib/types";

type ArtifactStatusBadgeProps = {
    status: ArtifactStatus;
};

const statusVariant: Record<
    ArtifactStatus,
    "default" | "secondary" | "outline" | "destructive"
> = {
    PENDING: "secondary",
    PROCESSING: "outline",
    READY: "default",
    FAILED: "destructive",
};

export function ArtifactStatusBadge({ status }: ArtifactStatusBadgeProps) {
    return (
        <Badge variant={statusVariant[status]} className="capitalize">
            {ARTIFACT_STATUS_LABELS[status]}
        </Badge>
    );
}

export function ArtifactTypeBadge({ type }: { type: ArtifactType }) {
    return (
        <Badge variant="outline">{ARTIFACT_TYPE_LABELS[type]}</Badge>
    );
}
