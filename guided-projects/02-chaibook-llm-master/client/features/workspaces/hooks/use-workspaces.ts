"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/lib/api";
import {
    createWorkspace,
    deleteWorkspace,
    getWorkspace,
    listWorkspaces,
    updateWorkspace,
} from "../lib/api";
import type { CreateWorkspaceInput, UpdateWorkspaceInput } from "../lib/types";

export const workspaceKeys = {
    all: ["workspaces"] as const,
    detail: (id: string) => ["workspaces", id] as const,
};

export function useWorkspaces() {
    return useQuery({
        queryKey: workspaceKeys.all,
        queryFn: listWorkspaces,
    });
}

export function useWorkspace(id: string) {
    return useQuery({
        queryKey: workspaceKeys.detail(id),
        queryFn: () => getWorkspace(id),
        retry: (_, error) =>
            !(error instanceof ApiError && error.status === 404),
    });
}

export function useCreateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateWorkspaceInput) => createWorkspace(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
        },
    });
}

export function useUpdateWorkspace(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateWorkspaceInput) => updateWorkspace(id, input),
        onSuccess: (workspace) => {
            queryClient.setQueryData(workspaceKeys.detail(id), workspace);
            void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
        },
    });
}

export function useDeleteWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteWorkspace(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: workspaceKeys.detail(id) });
            void queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
        },
    });
}
