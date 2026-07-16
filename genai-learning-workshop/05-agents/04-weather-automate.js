import { GoogleGenAI, Type } from "@google/genai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getWeather(city) {
  // Imagine calling a weather API here
  return "42 degrees C";
}

const availableTools = {
  get_weather: getWeather,
};

const SYSTEM_PROMPT = `
You are a helpful AI Assistant specialized in resolving user queries.

You work in the following sequence:

1. plan
2. action
3. observe
4. output

Rules:
- Return exactly one JSON object at a time.
- Wait for the observation after an action.
- Follow the JSON schema.

JSON Schema:
{
  "step": "string",
  "content": "string",
  "function": "string",
  "input": "string",
  "output": "string"
}

Available Tools:
- get_weather(city): Returns the weather of the city.
`;

const rl = readline.createInterface({ input, output });

const query = await rl.question("> ");

const contents = [
  {
    role: "user",
    parts: [
      {
        text: `${SYSTEM_PROMPT}

Question:
${query}`,
      },
    ],
  },
];

while (true) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",

    config: {
      responseMimeType: "application/json",

      responseSchema: {
        type: Type.OBJECT,
        properties: {
          step: {
            type: Type.STRING,
          },
          content: {
            type: Type.STRING,
          },
          function: {
            type: Type.STRING,
          },
          input: {
            type: Type.STRING,
          },
          output: {
            type: Type.STRING,
          },
        },
      },
    },

    contents,
  });

  const parsed = JSON.parse(response.text);

  contents.push({
    role: "model",
    parts: [{ text: response.text }],
  });

  switch (parsed.step) {
    case "plan":
      console.log("🧠:", parsed.content);

      contents.push({
        role: "user",
        parts: [{ text: "Continue." }],
      });

      break;

    case "action": {
      const toolName = parsed.function;
      const toolInput = parsed.input;

      console.log(`🔨 Calling Tool: ${toolName}("${toolInput}")`);

      if (availableTools[toolName]) {
        const toolOutput = availableTools[toolName](toolInput);

        contents.push({
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                step: "observe",
                output: toolOutput,
              }),
            },
          ],
        });
      } else {
        contents.push({
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                step: "observe",
                output: "Tool not found.",
              }),
            },
          ],
        });
      }

      break;
    }

    case "output":
      console.log("\n🤖:", parsed.content);
      rl.close();
      process.exit(0);

    default:
      console.log(parsed);
      rl.close();
      process.exit(0);
  }
}