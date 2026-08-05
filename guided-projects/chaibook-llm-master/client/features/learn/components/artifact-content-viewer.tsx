"use client";

import type { LearningArtifact } from "../lib/types";
import { FlashcardsViewer } from "./viewers/flashcards-viewer";
import { MindMapViewer } from "./viewers/mindmap-viewer";
import { QuizViewer } from "./viewers/quiz-viewer";
import { ReportViewer } from "./viewers/report-viewer";
import { SummaryViewer } from "./viewers/summary-viewer";
import { TakeawaysViewer } from "./viewers/takeaways-viewer";

type ArtifactContentViewerProps = {
    artifact: LearningArtifact;
    workspaceId: string;
};

export function ArtifactContentViewer({
    artifact,
    workspaceId,
}: ArtifactContentViewerProps) {
    const content = artifact.content;

    if (!content) {
        return null;
    }

    switch (artifact.type) {
        case "SUMMARY":
            return (
                <SummaryViewer
                    markdown={
                        typeof content.markdown === "string"
                            ? content.markdown
                            : ""
                    }
                />
            );
        case "TAKEAWAYS":
            return (
                <TakeawaysViewer
                    items={Array.isArray(content.items)
                        ? content.items.filter(
                              (item): item is string => typeof item === "string",
                          )
                        : []}
                />
            );
        case "FLASHCARDS":
            return (
                <FlashcardsViewer
                    cards={Array.isArray(content.cards) ? content.cards : []}
                />
            );
        case "QUIZ":
            return (
                <QuizViewer
                    questions={
                        Array.isArray(content.questions)
                            ? content.questions
                            : []
                    }
                />
            );
        case "MINDMAP":
            return (
                <MindMapViewer
                    workspaceId={workspaceId}
                    nodes={Array.isArray(content.nodes) ? content.nodes : []}
                    edges={Array.isArray(content.edges) ? content.edges : []}
                />
            );
        case "REPORT":
            return (
                <ReportViewer
                    markdown={
                        typeof content.markdown === "string"
                            ? content.markdown
                            : ""
                    }
                    sections={
                        Array.isArray(content.sections)
                            ? content.sections
                            : undefined
                    }
                />
            );
        default:
            return null;
    }
}
