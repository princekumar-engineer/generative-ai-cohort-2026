import { apiFetch } from "@/shared/lib/api";
import type {
    CreateMemoryInput,
    UpdateMemoryInput,
    UserMemory,
} from "./types";

export function listMemories() {
    return apiFetch<UserMemory[]>("/api/memory");
}

export function createMemory(input: CreateMemoryInput) {
    return apiFetch<UserMemory>("/api/memory", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateMemory(memoryId: string, input: UpdateMemoryInput) {
    return apiFetch<UserMemory>(`/api/memory/${memoryId}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export function deleteMemory(memoryId: string) {
    return apiFetch<void>(`/api/memory/${memoryId}`, {
        method: "DELETE",
    });
}
