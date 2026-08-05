"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createArtifact,
    deleteArtifact,
    getArtifact,
    listArtifacts,
} from "../lib/api";
import type { CreateArtifactInput } from "../lib/types";

export function artifactKeys(workspaceId: string) {
    return {
        all: ["artifacts", workspaceId] as const,
        list: () => ["artifacts", workspaceId, "list"] as const,
        detail: (artifactId: string) =>
            ["artifacts", workspaceId, artifactId] as const,
    };
}

export function useArtifacts(workspaceId: string) {
    return useQuery({
        queryKey: artifactKeys(workspaceId).list(),
        queryFn: () => listArtifacts(workspaceId),
        refetchInterval: (query) => {
            const hasProcessing = query.state.data?.some(
                (artifact) =>
                    artifact.status === "PENDING" ||
                    artifact.status === "PROCESSING",
            );
            return hasProcessing ? 3000 : false;
        },
    });
}

export function useArtifact(workspaceId: string, artifactId: string) {
    return useQuery({
        queryKey: artifactKeys(workspaceId).detail(artifactId),
        queryFn: () => getArtifact(workspaceId, artifactId),
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            return status === "PENDING" || status === "PROCESSING"
                ? 3000
                : false;
        },
    });
}

export function useCreateArtifact(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateArtifactInput) =>
            createArtifact(workspaceId, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: artifactKeys(workspaceId).all,
            });
        },
    });
}

export function useDeleteArtifact(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (artifactId: string) =>
            deleteArtifact(workspaceId, artifactId),
        onSuccess: (_, artifactId) => {
            queryClient.removeQueries({
                queryKey: artifactKeys(workspaceId).detail(artifactId),
            });
            void queryClient.invalidateQueries({
                queryKey: artifactKeys(workspaceId).all,
            });
        },
    });
}
