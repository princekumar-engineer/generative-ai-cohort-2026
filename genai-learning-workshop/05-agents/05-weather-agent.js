import { GoogleGenAI, Type } from "@google/genai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t`
    );

    if (!response.ok) {
      return `Sorry, I couldn't get the weather for ${city}.`;
    }

    const weather = await response.text();
    return `The weather in ${city} is ${weather}.`;
  } catch (error) {
    return `Error fetching weather: ${error.message}`;
  }
}

const availableTools = {
  get_weather: getWeather,
};

const SYSTEM_PROMPT = `
You are a helpful AI Assistant specialized in resolving user queries.

You work in this order:

1. plan
2. action
3. observe
4. output

Rules:
- Return exactly one JSON object.
- Perform only one step at a time.
- Wait for the observation after an action.

Available Tools:
- get_weather(city): Returns the weather of a city.

Output Schema:
{
  "step": "string",
  "content": "string",
  "function": "string",
  "input": "string",
  "output": "string"
}
`;

const rl = readline.createInterface({
  input,
  output,
});

const contents = [
  {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }],
  },
];

while (true) {
  const query = await rl.question("> ");

  contents.push({
    role: "user",
    parts: [{ text: query }],
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

    const parsed = JSON.parse(response.text);

    contents.push({
      role: "model",
      parts: [{ text: response.text }],
    });

    if (parsed.step === "plan") {
      console.log("🧠:", parsed.content);

      contents.push({
        role: "user",
        parts: [{ text: "Continue." }],
      });

      continue;
    }

    if (parsed.step === "action") {
      const toolName = parsed.function;
      const toolInput = parsed.input;

      console.log(`🔨 Calling Tool: ${toolName}("${toolInput}")`);

      let toolOutput = "Tool not found.";

      if (availableTools[toolName]) {
        toolOutput = await availableTools[toolName](toolInput);
      }

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

      continue;
    }

    if (parsed.step === "output") {
      console.log("🤖:", parsed.content);
      break;
    }
  }
}