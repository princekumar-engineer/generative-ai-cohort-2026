import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/*
Simple chat with AI
====================
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Hey, there",
});

console.log(response.text);
*/

/*
No access to real-time data
===========================
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "What is the weather today?",
});

console.log(response.text);
*/

/*
Stateless responses
===================
const response1 = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "Hey, my name is Prince",
});

console.log(response1.text);

const response2 = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: "What's my name?",
});

console.log(response2.text);

// No access to previous conversation unless you provide it.
*/

/*
Provide history and context
===========================
*/
const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  contents: [
    {
      role: "user",
      parts: [{ text: "Hey, my name is Prince" }],
    },
    {
      role: "model",
      parts: [
        {
          text: "Hi Prince, it's nice to meet you! How can I help you today?",
        },
      ],
    },
    {
      role: "user",
      parts: [{ text: "What's my name?" }],
    },
    {
      role: "model",
      parts: [{ text: "Your name is Prince." }],
    },
    {
      role: "user",
      parts: [{ text: "How are you?" }],
    },
  ],
});

console.log(response.text);