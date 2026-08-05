export type ArtifactType =
    | "SUMMARY"
    | "TAKEAWAYS"
    | "FLASHCARDS"
    | "QUIZ"
    | "MINDMAP"
    | "REPORT";

export type ArtifactStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export type LearningArtifact = {
    id: string;
    workspaceId: string;
    type: ArtifactType;
    title: string;
    content: Record<string, unknown> | null;
    sourceIds: string[];
    status: ArtifactStatus;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateArtifactInput = {
    type: ArtifactType;
    title?: string;
    sourceIds?: string[];
};

export type Flashcard = { front: string; back: string };

export type QuizQuestion = {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
};

export type MindMapNode = { id: string; label: string };
export type MindMapEdge = { id: string; source: string; target: string };
