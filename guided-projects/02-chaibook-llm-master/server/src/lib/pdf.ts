/**
 * PDF text extraction utilities using `unpdf`.
 *
 * Supports in-memory buffers and Cloudinary-hosted PDFs with signed URL
 * fallback when public access returns 401.
 */

import { extractText, getDocumentProxy } from "unpdf";
import { getSignedCloudinaryDownloadUrl } from "./cloudinary.js";

/** Result of extracting text from a PDF document. */
export type PdfExtractResult = {
    text: string;
    pages: string[];
    pageCount: number;
};

/**
 * Extracts plain text from a PDF buffer (upload-time or downloaded file).
 *
 * @param buffer - PDF bytes as Buffer or ArrayBuffer
 * @returns Joined full text, per-page strings, and total page count
 * @throws When no text could be extracted from the PDF
 *
 */
export async function extractPdfFromBuffer(
    buffer: ArrayBuffer | Buffer,
): Promise<PdfExtractResult> {
    const arrayBuffer =
        buffer instanceof Buffer
            ? (buffer.buffer.slice(
                  buffer.byteOffset,
                  buffer.byteOffset + buffer.byteLength,
              ) as ArrayBuffer)
            : buffer;

    const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });

    const pages = Array.isArray(text)
        ? text.map((page) => page.trim())
        : [String(text).trim()];

    const joined = pages.filter(Boolean).join("\n\n");

    if (!joined) {
        throw new Error("No text could be extracted from the PDF");
    }

    return {
        text: joined,
        pages,
        pageCount: totalPages,
    };
}

async function downloadPdf(url: string) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to download PDF (${response.status})`);
    }

    return response.arrayBuffer();
}

/**
 * Extracts text from a PDF stored on Cloudinary.
 *
 * Tries the public `fileUrl` first; on 401, falls back to a signed download URL
 * when `publicId` and Cloudinary API credentials are available.
 *
 * @param input - Cloudinary file URL, public id, and resource type
 * @returns Extracted text and per-page content
 * @throws When download or extraction fails, or signed URL cannot be generated
 *
 */
export async function extractPdfFromCloudinary(input: {
    fileUrl: string;
    publicId?: string;
    resourceType?: "raw" | "image";
}): Promise<PdfExtractResult> {
    try {
        const buffer = await downloadPdf(input.fileUrl);
        return await extractPdfFromBuffer(buffer);
    } catch (error) {
        const isUnauthorized =
            error instanceof Error && error.message.includes("(401)");

        if (!isUnauthorized || !input.publicId) {
            throw error;
        }

        const signedUrl = getSignedCloudinaryDownloadUrl(
            input.publicId,
            input.resourceType ?? "raw",
        );

        if (!signedUrl) {
            throw new Error(
                "PDF download requires authentication. Add CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to server/.env, or re-upload the PDF.",
            );
        }

        const buffer = await downloadPdf(signedUrl);
        return extractPdfFromBuffer(buffer);
    }
}
