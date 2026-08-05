export type UserMemory = {
    id: string;
    memory: string;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown> | null;
    categories?: string[];
    source: "manual" | "learned";
};

export type CreateMemoryInput = {
    memory: string;
};

export type UpdateMemoryInput = {
    memory: string;
};
