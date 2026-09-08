import { inngest } from "../client.js";
import { updateJob } from "../../jobs/jobStore.js";
import { askQuestion } from "../../services/rag.js";

export const askQuestionFn = inngest.createFunction(
  { id: "ask-question", triggers: [{ event: "chat/question.requested" }] },
  async ({ event, step }) => {
    const { jobId, repo, question } = event.data;

    updateJob(jobId, { status: "running" });

    try {
      const result = await step.run("retrieve-and-answer", async () => {
        return askQuestion(repo, question);
      });

      updateJob(jobId, {
        status: "completed",
        answer: result.answer,
        sources: result.sources,
      });

      return {
        jobId,
        repo,
        question,
        status: "completed",
        answer: result.answer,
        sources: result.sources,
      };
    } catch (error) {
      updateJob(jobId, {
        status: "failed",
        error: error.message,
      });
      throw error;
    }
  },
);
