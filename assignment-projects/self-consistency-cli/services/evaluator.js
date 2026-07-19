import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { EvaluationSchema } from "../schemas/answerSchema.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function evaluate(question, answers) {
  const answersText = Object.entries(answers)
    .filter(([_, answer]) => answer)
    .map(
      ([model, answer]) => `
## ${model.toUpperCase()} RESPONSE

${answer}
`
    )
    .join("\n");

  const prompt = `
You are an expert AI reviewer, fact-checker, and response synthesizer.

Your goal is to produce the highest-quality answer by combining the strengths of multiple AI-generated responses.

# User Question

${question}

# AI Responses

${answersText}

# Your Tasks

1. Carefully compare all available responses.
2. Identify factual errors or inconsistencies.
3. Correct any mistakes.
4. Merge the strongest explanations.
5. Remove duplicate information.
6. Add important missing details if necessary.
7. Improve clarity, readability, and structure.
8. Produce one polished answer.

# Rules

- Never mention Gemini, Llama, Qwen, Google, OpenRouter, or any AI model.
- Never mention that multiple responses were compared.
- Never say "according to another model."
- Write as if this is the only answer shown to the user.
- Keep the answer accurate, concise, and complete.

# Formatting Guidelines

Use beautiful Markdown.

When appropriate:

- Use headings
- Use bullet points
- Use numbered lists
- Use Markdown tables
- Use **bold** text
- Use blockquotes for notes
- Use fenced code blocks with the correct language

# Special Cases

If the user asks for:

- Code only → Return only code.
- Explanation → Explain first, then provide examples.
- Comparison → Use a Markdown table.
- Steps → Use a numbered list.
- Mathematics → Show calculations before the final answer.

Return the response using the provided JSON schema.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            finalAnswer: {
              type: Type.STRING,
              description:
                "The final synthesized answer formatted in Markdown.",
            },
            summary: {
              type: Type.STRING,
              description:
                "A brief summary describing how the final answer was synthesized.",
            },
            strengths: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
            confidence: {
              type: Type.NUMBER,
              description:
                "Confidence score between 0.0 and 1.0.",
            },
          },
          required: [
            "finalAnswer",
            "summary",
            "strengths",
            "confidence",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text);

    return EvaluationSchema.parse(parsed);
  } catch (err) {
    console.error("Evaluator Error:", err.message);

    return EvaluationSchema.parse({
      finalAnswer:
        Object.values(answers).find(Boolean) ||
        "Unable to generate a final answer.",
      summary:
        "The evaluator failed, so the first available response was returned.",
      strengths: [],
      confidence: 0.5,
    });
  }
}