import { headers } from "next/headers";
import type { Workspace } from "./types";

const apiUrl = process.env.API_URL ?? "http://localhost:8080";

async function fetchWorkspace(id: string): Promise<Workspace | null> {
    const requestHeaders = await headers();
    const cookie = requestHeaders.get("cookie") ?? "";

    const response = await fetch(`${apiUrl}/api/workspaces/${id}`, {
        headers: { cookie },
        cache: "no-store",
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error("Failed to fetch workspace");
    }

    return response.json() as Promise<Workspace>;
}

export async function getWorkspaceOrNull(id: string) {
    return fetchWorkspace(id);
}
