"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createMemory,
    deleteMemory,
    listMemories,
    updateMemory,
} from "../lib/api";
import type { CreateMemoryInput, UpdateMemoryInput } from "../lib/types";

export const memoryKeys = {
    all: ["memory"] as const,
    list: () => ["memory", "list"] as const,
};

export function useMemories() {
    return useQuery({
        queryKey: memoryKeys.list(),
        queryFn: listMemories,
    });
}

export function useCreateMemory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateMemoryInput) => createMemory(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: memoryKeys.all });
        },
    });
}

export function useUpdateMemory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            memoryId,
            input,
        }: {
            memoryId: string;
            input: UpdateMemoryInput;
        }) => updateMemory(memoryId, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: memoryKeys.all });
        },
    });
}

export function useDeleteMemory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (memoryId: string) => deleteMemory(memoryId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: memoryKeys.all });
        },
    });
}
