import fs from "node:fs/promises";
import crypto from "node:crypto";
// Import the lib entry directly to avoid pdf-parse's debug-mode file read on import.
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { config } from "./config.js";
import { qdrant, ensureCollection } from "./qdrant.js";
import { embedTexts } from "./openai.js";

/** Read a PDF from disk and return its raw text. */
async function readPdfText(filePath) {
  const buffer = await fs.readFile(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

/**
 * Split text into overlapping chunks (~chunkSize chars, chunkOverlap overlap),
 * breaking on whitespace boundaries where possible.
 */
export function chunkText(text, chunkSize = config.chunking.chunkSize, overlap = config.chunking.chunkOverlap) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const chunks = [];
  let start = 0;

  while (start < clean.length) {
    let end = Math.min(start + chunkSize, clean.length);

    // Try to end on a space so we don't cut words in half.
    if (end < clean.length) {
      const lastSpace = clean.lastIndexOf(" ", end);
      if (lastSpace > start) end = lastSpace;
    }

    const chunk = clean.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= clean.length) break;
    start = end - overlap; // step forward with overlap
    if (start < 0) start = 0;
  }

  return chunks;
}

/**
 * Full indexing pipeline for a single uploaded PDF:
 * read -> chunk -> embed -> upsert into Qdrant.
 */
export async function indexPdf({ filePath, originalName }) {
  const collection = await ensureCollection();

  const text = await readPdfText(filePath);
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return { chunks: 0, message: "No extractable text found in PDF" };
  }

  const vectors = await embedTexts(chunks);

  const points = chunks.map((chunk, i) => ({
    id: crypto.randomUUID(),
    vector: vectors[i],
    payload: {
      text: chunk,
      source: originalName,
      filePath,
      chunkIndex: i,
    },
  }));

  await qdrant.upsert(collection, { wait: true, points });

  return { chunks: chunks.length, collection };
}
