import { apiFetch } from "@/shared/lib/api";
import type {
    CreateWorkspaceInput,
    UpdateWorkspaceInput,
    Workspace,
} from "./types";

export function listWorkspaces() {
    return apiFetch<Workspace[]>("/api/workspaces");
}

export function getWorkspace(id: string) {
    return apiFetch<Workspace>(`/api/workspaces/${id}`);
}

export function createWorkspace(input: CreateWorkspaceInput) {
    return apiFetch<Workspace>("/api/workspaces", {
        method: "POST",
        body: JSON.stringify(input),
    });
}

export function updateWorkspace(id: string, input: UpdateWorkspaceInput) {
    return apiFetch<Workspace>(`/api/workspaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    });
}

export function deleteWorkspace(id: string) {
    return apiFetch<void>(`/api/workspaces/${id}`, {
        method: "DELETE",
    });
}
