import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getWeather(city) {
  // Imagine this calls a weather API
  return "42 degrees C";
}

const SYSTEM_PROMPT = `
You are a helpful AI Assistant who specializes in resolving user queries.

You work in the following sequence:
1. plan
2. action
3. observe
4. output

Rules:
- Return exactly one JSON object at a time.
- If an action is needed, specify the function name and input.
- Wait for the observation before producing the final output.

Available Tools:
- get_weather(city): Returns the weather of a city.

JSON Schema:
{
  "step": "string",
  "content": "string",
  "function": "string",
  "input": "string"
}
`;

const contents = [
  {
    role: "user",
    parts: [
      {
        text: `${SYSTEM_PROMPT}

Question:
What is the weather in Hyderabad?`,
      },
    ],
  },

  // Few-shot examples
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          step: "plan",
          content:
            "The user wants the weather of Hyderabad. I should use the get_weather tool.",
        }),
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          step: "action",
          function: "get_weather",
          input: "Hyderabad",
        }),
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          step: "observe",
          content: "24 degrees C",
        }),
      },
    ],
  },
];

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
      },
    },
  },

  contents,
});

console.log(JSON.parse(response.text));