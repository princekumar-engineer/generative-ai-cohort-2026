import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { enqueueIndexingJob, enqueueQueryJob, queryQueue } from "./queue.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure the uploads directory exists.
fs.mkdirSync(uploadDir, { recursive: true });

// --- Multer config: store PDFs on disk with a unique name ---
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomUUID()}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are allowed"));
  },
});

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// --- POST /index : upload a PDF and enqueue an indexing job ---
app.post("/index", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No PDF file uploaded (field: 'file')" });
  }

  try {
    const job = await enqueueIndexingJob({
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    return res.status(202).json({
      message: "File uploaded and queued for indexing",
      jobId: job.id,
      file: {
        originalName: req.file.originalname,
        storedAs: req.file.filename,
        size: req.file.size,
      },
    });
  } catch (err) {
    console.error("Failed to enqueue indexing job:", err);
    return res.status(500).json({ error: "Failed to queue file for indexing" });
  }
});

// --- POST /query : enqueue a RAG query job, return the job id to poll ---
app.post("/query", async (req, res) => {
  const query = req.body?.query;
  if (typeof query !== "string" || query.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Body must include a non-empty 'query' string" });
  }

  try {
    const job = await enqueueQueryJob({ query: query.trim() });
    return res.status(202).json({
      message: "Query queued",
      jobId: job.id,
      poll: `/query/${job.id}`,
    });
  } catch (err) {
    console.error("Failed to enqueue query job:", err);
    return res.status(500).json({ error: "Failed to queue query" });
  }
});

// --- GET /query/:id : poll for the status/result of a query job ---
app.get("/query/:id", async (req, res) => {
  try {
    const job = await queryQueue.getJob(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const state = await job.getState();

    if (state === "completed") {
      return res.json({
        jobId: job.id,
        status: state,
        result: job.returnvalue,
      });
    }
    if (state === "failed") {
      return res
        .status(200)
        .json({ jobId: job.id, status: state, error: job.failedReason });
    }

    // waiting | active | delayed | paused
    return res.json({ jobId: job.id, status: state });
  } catch (err) {
    console.error("Failed to fetch query job:", err);
    return res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Multer / route error handler.
app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(400).json({ error: err.message });
});

app.listen(config.port, () => {
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
});
