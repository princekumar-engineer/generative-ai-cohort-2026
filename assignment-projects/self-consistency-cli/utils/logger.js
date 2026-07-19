import fs from "fs";
import path from "path";
import chalk from "chalk";

const OUTPUT_DIR = path.join(process.cwd(), "output");

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function getTimestamp() {
  return new Date().toLocaleString();
}

// ---------- Console Logs ----------

export function info(message) {
  console.log(chalk.cyan(`[INFO] ${getTimestamp()} - ${message}`));
}

export function success(message) {
  console.log(chalk.green(`[SUCCESS] ${getTimestamp()} - ${message}`));
}

export function warn(message) {
  console.log(chalk.yellow(`[WARNING] ${getTimestamp()} - ${message}`));
}

export function error(message) {
  // Renamed to avoid shadowing the global Error or confusing it with console.error
  console.log(chalk.red(`[ERROR] ${getTimestamp()} - ${message}`));
}

// ---------- Save Result ----------

export async function saveOutput(question, responses, evaluation) {
  const timestamp = new Date().toISOString();
  const filename = `result-${timestamp.replace(/[:.]/g, "-")}.json`;

  // Dynamically map over all provided models in the responses object
  const formattedResponses = {};
  for (const [modelName, data] of Object.entries(responses)) {
    if (data) {
      formattedResponses[modelName] = {
        provider: data.provider,
        model: data.model,
        timestamp: data.timestamp,
        answer: data.answer,
      };
    }
  }

  const output = {
    timestamp,
    question,
    responses: formattedResponses,
    evaluation,
  };

  const filePath = path.join(OUTPUT_DIR, filename);

  try {
    // Using async file writing to prevent blocking the event loop
    await fs.promises.writeFile(
      filePath,
      JSON.stringify(output, null, 2),
      "utf8"
    );
    success(`Results saved to ${filePath}`);
  } catch (err) {
    errorLog(`Failed to save results to ${filePath}. Error: ${err.message}`);
  }
}