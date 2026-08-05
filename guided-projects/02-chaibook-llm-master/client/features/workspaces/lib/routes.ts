export const workspaceRoutes = {
    list: "/dashboard",
    detail: (id: string) => `/workspace/${id}`,
    settings: (id: string) => `/workspace/${id}/settings`,
} as const;

export function isWorkspaceRoute(pathname: string) {
    return pathname === workspaceRoutes.list || pathname.startsWith("/workspace/");
}
