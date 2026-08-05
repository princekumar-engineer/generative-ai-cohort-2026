import { inngest } from "./client.js";
import {
    chunkSourceContent,
    embedAndIndexSource,
    extractSourceContent,
    markSourceFailed,
    markSourceProcessing,
} from "../services/source-processing.service.js";
import { findSourceById } from "../repositories/source.repository.js";
import { findChunksBySourceId } from "../repositories/source-chunk.repository.js";
import { processArtifactById } from "../services/artifact.service.js";
import { summarizeConversationById } from "../services/conversation-memory.service.js";

export const processSource = inngest.createFunction(
    {
        id: "process-source",
        retries: 3,
        triggers: [{ event: "source/created" }],
    },
    async ({ event, step }) => {
        const { sourceId } = event.data;

        await step.run("mark-processing", () => markSourceProcessing(sourceId));

        try {
            const extracted = await step.run("extract-content", () =>
                extractSourceContent(sourceId),
            );

            await step.run("chunk-content", () =>
                chunkSourceContent(
                    sourceId,
                    extracted.text,
                    extracted.pages,
                ),
            );

            const result = await step.run("embed-and-index", async () => {
                const source = await findSourceById(sourceId);
                if (!source) {
                    throw new Error("Source not found");
                }

                const chunks = await findChunksBySourceId(sourceId);
                await embedAndIndexSource(source, chunks);

                return { chunkCount: chunks.length };
            });

            return { sourceId, status: "READY", ...result };
        } catch (error) {
            await step.run("mark-failed", async () => {
                const source = await findSourceById(sourceId);
                if (source) {
                    await markSourceFailed(sourceId, error, source.metadata);
                }
            });
            throw error;
        }
    },
);

export const generateArtifact = inngest.createFunction(
    {
        id: "generate-artifact",
        retries: 2,
        triggers: [{ event: "artifact/generate" }],
    },
    async ({ event, step }) => {
        const { artifactId } = event.data;

        await step.run("generate", () => processArtifactById(artifactId));

        return { artifactId, status: "READY" };
    },
);

export const summarizeConversation = inngest.createFunction(
    {
        id: "summarize-conversation",
        retries: 2,
        triggers: [{ event: "conversation/summarize" }],
    },
    async ({ event, step }) => {
        const { conversationId, userId } = event.data;

        await step.run("summarize", () =>
            summarizeConversationById(conversationId, userId),
        );

        return { conversationId, status: "SUMMARIZED" };
    },
);

export const functions = [processSource, generateArtifact, summarizeConversation];