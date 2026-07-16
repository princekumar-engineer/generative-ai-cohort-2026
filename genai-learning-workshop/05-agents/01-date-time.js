import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const now = new Date();

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const formattedDateTime = formatter.format(now);

const SYSTEM_PROMPT = `
You are a helpful AI Assistant.

Today is ${formattedDateTime} IST.
`;

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  config: {
    systemInstruction: SYSTEM_PROMPT,
  },
  contents: "What is the date and time today?",
});

console.log(response.text);