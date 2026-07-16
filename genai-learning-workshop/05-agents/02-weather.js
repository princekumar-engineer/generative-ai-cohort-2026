import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Fake weather function
function getWeather(city) {
  // Imagine this calls a weather API
  return "42°C";
}

const now = new Date();

const date = now.toLocaleDateString("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const time = now.toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const SYSTEM_PROMPT = `
You are a helpful AI Assistant.

Today is ${date} and the time is ${time} IST.

Hyderabad's weather is 24°C.
`;

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  config: {
    systemInstruction: SYSTEM_PROMPT,
  },
  contents: "What is the weather in Hyderabad?",
});

console.log(response.text);