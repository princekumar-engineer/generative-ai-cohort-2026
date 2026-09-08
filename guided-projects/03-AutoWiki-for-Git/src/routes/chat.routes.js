import { Router } from "express";
import { inngest } from "../inngest/client.js";
import { createJob, getJob } from "../jobs/jobStore.js";
import { parseRepo } from "../services/github.js";

const router = Router();

function formatChatJob(job) {
  if (!job) return null;

  return {
    jobId: job.jobId,
    repo: job.repo,
    question: job.question ?? null,
    status: job.status,
    answer: job.answer ?? null,
    sources: job.sources ?? [],
    ...(job.error ? { error: job.error } : {}),
  };
}

async function startChatJob(repo, question) {
  const { repoKey } = parseRepo(repo);
  const job = createJob(repoKey, { question });

  await inngest.send({
    name: "chat/question.requested",
    data: { jobId: job.jobId, repo: repoKey, question },
  });

  return formatChatJob(job);
}

router.get("/", async (req, res) => {
  const { repo, question } = req.query;

  if (!repo || !question) {
    return res.status(400).json({ error: "repo and question are required" });
  }

  res.status(202).json(await startChatJob(repo, question));
});

router.post("/", async (req, res) => {
  const { repo, question } = req.body ?? {};

  if (!repo || !question) {
    return res.status(400).json({ error: "repo and question are required" });
  }

  res.status(202).json(await startChatJob(repo, question));
});

router.get("/:jobId", (req, res) => {
  const job = getJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json(formatChatJob(job));
});

export default router;
