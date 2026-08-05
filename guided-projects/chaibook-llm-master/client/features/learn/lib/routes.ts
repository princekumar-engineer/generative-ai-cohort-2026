export const learnRoutes = {
    hub: (workspaceId: string) => `/workspace/${workspaceId}/learn`,
    detail: (workspaceId: string, artifactId: string) =>
        `/workspace/${workspaceId}/learn/${artifactId}`,
} as const;
