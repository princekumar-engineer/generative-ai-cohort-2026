import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Explain JavaScript async/await with an example.',
    });

    console.log(response.text);
  } catch (err) {
    console.error(err);
  }
}

main();