/**
 * Source processing pipeline for RAG (Retrieval-Augmented Generation).
 *
 * When a user uploads a PDF or adds text, this service turns raw source data
 * into searchable vector embeddings. The full flow:
 *
 * ```
 * Source (PDF / text)
 *   → extractSourceContent   — pull plain text (from DB or Cloudinary PDF)
 *   → chunkSourceContent     — split into chunks, save to Postgres
 *   → embedAndIndexSource    — embed chunks with OpenAI, upsert to Pinecone
 *   → status: READY
 * ```
 *
 * Inngest runs these steps as separate durable jobs.
 */

import type { PineconeRecord } from "@pinecone-database/pinecone";
import type { Prisma } from "../generated/prisma/client.js";
import { chunkPages, chunkText } from "../lib/chunking.js";
import { embedTexts } from "../lib/openai.js";
import { extractPdfFromCloudinary } from "../lib/pdf.js";
import {
    deleteSourceVectors,
    type VectorMetadata,
    upsertSourceVectors,
} from "../lib/pinecone.js";
import {
    createSourceChunks,
    deleteChunksBySourceId,
    findChunksBySourceId,
    type SourceChunkRecord,
} from "../repositories/source-chunk.repository.js";
import {
    findSourceById,
    updateSourceRecord,
    type SourceRecord,
} from "../repositories/source.repository.js";

/** Shape of JSON stored on a source's `metadata` column. */
type SourceMetadata = {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    publicId?: string;
    resourceType?: "raw" | "image";
    importedFrom?: string;
    videoId?: string;
    processingError?: string;
    chunkCount?: number;
    pageCount?: number;
    indexedAt?: string;
};

/**
 * Reads extractable text from a source record.
 *
 * **Two paths:**
 * 1. **Text already in DB** — returns `source.content` (TEXT, URL scrape, YouTube transcript, etc.)
 * 2. **PDF** — downloads from Cloudinary and runs PDF text extraction
 *
 * @throws If PDF is missing `fileUrl` or source has no content at all
 *
 *
 */
async function extractSourceText(source: SourceRecord) {
    const text = source.content?.trim();
    if (text) {
        return {
            text,
            pageCount: undefined,
            pages: undefined,
        };
    }

    if (source.type === "PDF") {
        const metadata =
            source.metadata &&
            typeof source.metadata === "object" &&
            !Array.isArray(source.metadata)
                ? (source.metadata as SourceMetadata)
                : {};
        if (!metadata.fileUrl) {
            throw new Error("PDF source is missing fileUrl metadata");
        }

        const extracted = await extractPdfFromCloudinary({
            fileUrl: metadata.fileUrl,
            publicId: metadata.publicId,
            resourceType: metadata.resourceType ?? "image",
        });
        return {
            text: extracted.text,
            pageCount: extracted.pageCount,
            pages: extracted.pages,
        };
    }

    throw new Error(`Source ${source.id} has no extractable content`);
}

/**
 * Sets a source's status to `PROCESSING` while the pipeline runs.
 *
 */
export function markSourceProcessing(sourceId: string) {
    return updateSourceRecord(sourceId, { status: "PROCESSING" });
}

/**
 * Marks a source as `FAILED` and stores the error message in metadata.
 * Called when extract, chunk, or embed steps throw.
 *
 */
export async function markSourceFailed(
    sourceId: string,
    error: unknown,
    existingMetadata: SourceRecord["metadata"],
) {
    const message =
        error instanceof Error ? error.message : "Source processing failed";

    const metadata =
        existingMetadata &&
        typeof existingMetadata === "object" &&
        !Array.isArray(existingMetadata)
            ? (existingMetadata as SourceMetadata)
            : {};

    return updateSourceRecord(sourceId, {
        status: "FAILED",
        metadata: {
            ...metadata,
            processingError: message,
        },
    });
}

/**
 * Step 1 of the pipeline: load text from the source and persist it.
 *
 * - Fetches the source from Postgres
 * - Extracts text (from `content` column or PDF on Cloudinary)
 * - Saves extracted text back to `source.content`
 * - Updates `metadata.pageCount` for PDFs
 *
 * @returns Extracted text plus page array (PDF only) for the chunking step
 *
 */
export async function extractSourceContent(sourceId: string) {
    const source = await findSourceById(sourceId);
    if (!source) {
        throw new Error("Source not found");
    }

    const extracted = await extractSourceText(source);
    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? (source.metadata as SourceMetadata)
            : {};

    await updateSourceRecord(sourceId, {
        content: extracted.text,
        metadata: {
            ...metadata,
            pageCount: extracted.pageCount ?? metadata.pageCount,
        },
    });

    return {
        sourceId,
        workspaceId: source.workspaceId,
        text: extracted.text,
        pages: extracted.pages,
        source,
    };
}

/**
 * Step 2 of the pipeline: split text into chunks and save to Postgres.
 *
 * - Deletes any existing chunks for this source (safe re-processing)
 * - Uses `chunkPages` when PDF page array is available (keeps page metadata)
 * - Otherwise uses `chunkText` on the full string
 * - Stores each chunk with an estimated `tokenCount`
 *
 * @param sourceId - Source to attach chunks to
 * @param text - Full extracted text
 * @param pages - Optional per-page strings from PDF extraction
 * @returns Saved chunk records from the database
 *
 *
 */
export async function chunkSourceContent(
    sourceId: string,
    text: string,
    pages?: string[],
) {
    await deleteChunksBySourceId(sourceId);

    const chunks = pages?.length ? chunkPages(pages) : chunkText(text);

    if (chunks.length === 0) {
        throw new Error("No chunks were generated from source content");
    }

    return createSourceChunks(
        chunks.map((chunk) => ({
            sourceId,
            index: chunk.index,
            content: chunk.content,
            tokenCount: Math.ceil(chunk.content.length / 4),
            metadata: chunk.metadata as Prisma.InputJsonValue | undefined,
        })),
    );
}

/**
 * Step 3 of the pipeline: embed chunks and store vectors in Pinecone.
 *
 * - Sends chunk text to OpenAI in batches of 50
 * - Builds Pinecone records with embedding + searchable metadata
 * - Upserts vectors into the workspace namespace
 * - Marks source as `READY` with `chunkCount` and `indexedAt`
 *
 * Pinecone metadata includes enough context for retrieval without re-querying Postgres:
 * `sourceTitle`, `sourceType`, chunk `text` (truncated to 35k chars), and optional `page`.
 *
 * @param source - The parent source record
 * @param chunks - Chunk rows already saved in Postgres (must have `id`)
 * @returns Updated source record with status `READY`
 *
 *
 */
export async function embedAndIndexSource(
    source: SourceRecord,
    chunks: SourceChunkRecord[],
) {
    const batchSize = 50;
    const records: PineconeRecord<VectorMetadata>[] = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await embedTexts(batch.map((chunk) => chunk.content));

        for (let j = 0; j < batch.length; j += 1) {
            const chunk = batch[j]!;
            const embedding = embeddings[j]!;
            const chunkMetadata =
                chunk.metadata &&
                    typeof chunk.metadata === "object" &&
                    !Array.isArray(chunk.metadata)
                    ? (chunk.metadata as Record<string, unknown>)
                    : {};

            records.push({
                id: chunk.id,
                values: embedding,
                metadata: {
                    workspaceId: source.workspaceId,
                    sourceId: source.id,
                    chunkId: chunk.id,
                    chunkIndex: chunk.index,
                    sourceTitle: source.title,
                    sourceType: source.type,
                    text: chunk.content.slice(0, 35000),
                    ...(typeof chunkMetadata.page === "number"
                        ? { page: chunkMetadata.page }
                        : {}),
                },
            });
        }
    }

    await upsertSourceVectors(source.workspaceId, records);

    const metadata =
        source.metadata &&
        typeof source.metadata === "object" &&
        !Array.isArray(source.metadata)
            ? (source.metadata as SourceMetadata)
            : {};

    return updateSourceRecord(source.id, {
        status: "READY",
        metadata: {
            ...metadata,
            chunkCount: chunks.length,
            indexedAt: new Date().toISOString(),
            processingError: undefined,
        },
    });
}

/**
 * Removes a source from the vector index and deletes its chunks from Postgres.
 * Used when a source is deleted or needs to be fully re-indexed from scratch.
 *
 */
export async function removeSourceFromIndex(
    workspaceId: string,
    sourceId: string,
) {
    await deleteSourceVectors(workspaceId, sourceId);
    await deleteChunksBySourceId(sourceId);
}

/**
 * Returns all chunks for a source plus the total count.
 * Useful for debugging, admin UI, or verifying processing completed.
 *
 */
export async function listChunksForSource(sourceId: string) {
    const chunks = await findChunksBySourceId(sourceId);
    return { chunks, count: chunks.length };
}
