export type Workspace = {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    defaultModel: string;
    createdAt: string;
    updatedAt: string;
};

export type CreateWorkspaceInput = {
    title: string;
    description?: string;
    icon?: string;
    defaultModel?: string;
};

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>;
