import { inngest } from "../client.js";
import { updateJob } from "../../jobs/jobStore.js";
import { fetchRepoFiles } from "../../services/github.js";
import { chunkFiles } from "../../services/chunker.js";
import { saveChunks } from "../../services/vectorStore.js";

export const indexRepo = inngest.createFunction(
  { id: "index-repo", triggers: [{ event: "repo/index.requested" }] },
  async ({ event, step }) => {
    const { jobId, githubToken, owner, repo } = event.data;
    const repoName = repo.replace(/\.git$/, "");
    const repoKey = `${owner}/${repoName}`;

    updateJob(jobId, { status: "running" });

    const files = await step.run("fetch-github-files", async () => {
      return fetchRepoFiles(githubToken, owner, repoName);
    });

    const documents = await step.run("chunk-files", async () => {
      return chunkFiles(files, repoKey);
    });

    await step.run("save-to-pinecone", async () => {
      await saveChunks(repoKey, documents);
    });

    updateJob(jobId, {
      status: "completed",
      fileCount: files.length,
      chunkCount: documents.length,
    });

    return { repo: repoKey, fileCount: files.length, chunkCount: documents.length };
  },
);
