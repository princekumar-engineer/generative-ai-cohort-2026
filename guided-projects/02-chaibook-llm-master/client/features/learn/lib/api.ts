import { apiFetch } from "@/shared/lib/api";
import type { CreateArtifactInput, LearningArtifact } from "./types";

export function listArtifacts(workspaceId: string) {
    return apiFetch<LearningArtifact[]>(
        `/api/workspaces/${workspaceId}/artifacts`,
    );
}

export function getArtifact(workspaceId: string, artifactId: string) {
    return apiFetch<LearningArtifact>(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
    );
}

export function createArtifact(
    workspaceId: string,
    input: CreateArtifactInput,
) {
    return apiFetch<LearningArtifact>(
        `/api/workspaces/${workspaceId}/artifacts`,
        {
            method: "POST",
            body: JSON.stringify(input),
        },
    );
}

export function deleteArtifact(workspaceId: string, artifactId: string) {
    return apiFetch<void>(
        `/api/workspaces/${workspaceId}/artifacts/${artifactId}`,
        { method: "DELETE" },
    );
}
