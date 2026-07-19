import readline from "readline";
import chalk from "chalk";

import { askGemini } from "./services/gemini.js";
import { askLlama } from "./services/llama.js";
import { askQwen } from "./services/qwen.js";
import { evaluate } from "./services/evaluator.js";

import {
  info,
  success,
  error,
  saveOutput,
} from "./utils/logger.js";

import {
  startSpinner,
  succeedSpinner,
  failSpinner,
} from "./utils/spinner.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(chalk.cyan("Enter your question: "), async (question) => {
  if (!question.trim()) {
    error("Question cannot be empty.");
    rl.close();
    return;
  }

  const startTime = Date.now();

  try {
    info("Sending requests to Gemini, Llama, and Qwen...");

    startSpinner("Contacting AI models...");

    const modelStart = Date.now();

    const results = await Promise.allSettled([
      askGemini(question),
      askLlama(question),
      askQwen(question),
    ]);

    const [geminiResult, llamaResult, qwenResult] = results;

    const gemini =
      geminiResult.status === "fulfilled"
        ? geminiResult.value
        : null;

    const llama =
      llamaResult.status === "fulfilled"
        ? llamaResult.value
        : null;

    const qwen =
      qwenResult.status === "fulfilled"
        ? qwenResult.value
        : null;

    const modelTime = (
      (Date.now() - modelStart) /
      1000
    ).toFixed(2);

    succeedSpinner("Model requests completed.");

    // Log status
    if (gemini) {
      success(`Gemini (${gemini.model}) response received.`);
    } else {
      error(`Gemini failed: ${geminiResult.reason?.message}`);
    }

    if (llama) {
      success(`Llama (${llama.model}) response received.`);
    } else {
      error(`Llama failed: ${llamaResult.reason?.message}`);
    }

    if (qwen) {
      success(`Qwen (${qwen.model}) response received.`);
    } else {
      error(`Qwen failed: ${qwenResult.reason?.message}`);
    }

    // Display model responses
    console.log(
      chalk.blue.bold("\n================ GEMINI ================\n")
    );
    console.log(gemini?.answer ?? "No response.");

    console.log(
      chalk.green.bold("\n================ LLAMA =================\n")
    );
    console.log(llama?.answer ?? "No response.");

    console.log(
      chalk.yellow.bold("\n================ QWEN ==================\n")
    );
    console.log(qwen?.answer ?? "No response.");

    // Prepare evaluation
    const answers = {};

    if (gemini) answers.gemini = gemini.answer;
    if (llama) answers.llama = llama.answer;
    if (qwen) answers.qwen = qwen.answer;

    if (Object.keys(answers).length === 0) {
      throw new Error(
        "All AI providers failed. Unable to generate a final answer."
      );
    }

    startSpinner("Synthesizing final answer...");

    const evalStart = Date.now();

    const evaluation = await evaluate(question, answers);

    const evalTime = (
      (Date.now() - evalStart) /
      1000
    ).toFixed(2);

    succeedSpinner("Final answer generated.");

    // Final Answer
    console.log(
      chalk.magenta.bold(
        "\n========== FINAL SELF-CONSISTENT ANSWER ==========\n"
      )
    );

    console.log(evaluation.finalAnswer);

    console.log(chalk.cyan.bold("\nSummary"));
    console.log(evaluation.summary);

    console.log(chalk.cyan.bold("\nStrengths"));

    if (evaluation.strengths.length > 0) {
      evaluation.strengths.forEach((strength, index) => {
        console.log(`${index + 1}. ${strength}`);
      });
    } else {
      console.log("No strengths provided.");
    }

    console.log(
      chalk.green.bold(
        `\nConfidence: ${(evaluation.confidence * 100).toFixed(0)}%`
      )
    );

    const totalTime = (
      (Date.now() - startTime) /
      1000
    ).toFixed(2);

    console.log(chalk.gray("\n----------------------------------------"));
    console.log(chalk.gray(`Model Response Time : ${modelTime}s`));
    console.log(chalk.gray(`Evaluation Time     : ${evalTime}s`));
    console.log(chalk.gray(`Total Time          : ${totalTime}s`));
    console.log(chalk.gray("----------------------------------------"));

    saveOutput(
      question,
      {
        gemini,
        llama,
        qwen,
      },
      evaluation
    );

    success("Execution completed successfully.");
  } catch (err) {
    failSpinner("Execution failed.");

    error(err.message || "Unknown error occurred.");

    if (err.response?.data) {
      console.log(
        chalk.red("\nAPI Response:\n"),
        JSON.stringify(err.response.data, null, 2)
      );
    }
  } finally {
    rl.close();
  }
});