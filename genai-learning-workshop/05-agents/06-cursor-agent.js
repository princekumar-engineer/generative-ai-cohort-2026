import { GoogleGenAI, Type } from "@google/genai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t`
    );

    if (!response.ok) {
      return `Couldn't fetch weather for ${city}`;
    }

    const weather = await response.text();
    return `The weather in ${city} is ${weather}.`;
  } catch (err) {
    return err.message;
  }
}

// Allow only a few safe commands
const SAFE_COMMANDS = new Set([
  "pwd",
  "ls",
  "whoami",
]);

async function runCommand(command) {
  if (!SAFE_COMMANDS.has(command.trim())) {
    return "Command not allowed.";
  }

  try {
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (err) {
    return err.message;
  }
}

const availableTools = {
  get_weather: getWeather,
  run_command: runCommand,
};

const SYSTEM_PROMPT = `
You are a helpful AI assistant.

You operate in this sequence:

plan
action
observe
output

Available tools:

- get_weather(city)
- run_command(command)

Always return JSON.
`;

const contents = [
  {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }],
  },
];

const rl = readline.createInterface({
  input,
  output,
});

while (true) {
  const question = await rl.question("> ");

  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING },
            content: { type: Type.STRING },
            function: { type: Type.STRING },
            input: { type: Type.STRING },
            output: { type: Type.STRING },
          },
        },
      },

      contents,
    });

    const result = JSON.parse(response.text);

    contents.push({
      role: "model",
      parts: [{ text: response.text }],
    });

    if (result.step === "plan") {
      console.log("🧠", result.content);

      contents.push({
        role: "user",
        parts: [{ text: "Continue." }],
      });

      continue;
    }

    if (result.step === "action") {
      console.log(
        `🔨 Calling ${result.function}("${result.input}")`
      );

      let observation = "Tool not found.";

      if (availableTools[result.function]) {
        observation = await availableTools[result.function](
          result.input
        );
      }

      contents.push({
        role: "user",
        parts: [
          {
            text: JSON.stringify({
              step: "observe",
              output: observation,
            }),
          },
        ],
      });

      continue;
    }

    if (result.step === "output") {
      console.log("🤖", result.content);
      break;
    }
  }
}