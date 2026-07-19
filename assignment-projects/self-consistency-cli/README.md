# Self-Consistency Answer Engine (CLI)

A **CLI-based GenAI application** that improves answer quality using the **Self-Consistency** technique.

Instead of relying on a single Large Language Model (LLM), the application sends the same prompt to multiple AI models, collects their responses in parallel, validates them using **Zod**, and then uses **Gemini** as an evaluator to synthesize the best possible final answer.

This project was built as part of the **GenAI with JavaScript 2026** assignment.

---

# Features

* 💻 CLI-based application
* 🤖 Uses multiple AI models for every prompt
* ⚡ Parallel API orchestration with `Promise.allSettled()`
* ✅ Structured outputs validated using **Zod**
* 🧠 AI-powered answer synthesis using **Gemini**
* 📄 Displays every model's response separately
* ⏳ Beautiful CLI loading spinner using **Ora**
* 🎨 Colored terminal output using **Chalk**
* ❌ Graceful handling of provider failures
* 💾 Automatically saves execution results as JSON
* 📊 Displays response time and evaluation time
* 🔄 Dynamic evaluator that works with any number of model responses

---

# Models Used

| Purpose   | Model                  | Provider         |
| --------- | ---------------------- | ---------------- |
| Model 1   | Gemini 2.5 Flash       | Google AI Studio |
| Model 2   | Llama 3.3 70B Instruct | OpenRouter       |
| Model 3   | Qwen 3 30B A3B         | OpenRouter       |
| Evaluator | Gemini 2.5 Flash       | Google AI Studio |

---

# Self-Consistency Workflow

```text
                     User Prompt
                          │
                          ▼
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     Gemini          Llama 3.3         Qwen 3
 (Google AI)       (OpenRouter)    (OpenRouter)
          │               │               │
          └───────────────┼───────────────┘
                          ▼
             Zod Validation Layer
                          │
                          ▼
                Gemini Evaluator
          Compare • Correct • Merge
                          │
                          ▼
          Final Self-Consistent Answer
```

---

# Project Structure

```text
self-consistency-cli/
│
├── index.js
├── package.json
├── README.md
├── .env
│
├── schemas/
│   └── answerSchema.js
│
├── services/
│   ├── gemini.js
│   ├── llama.js
│   ├── qwen.js
│   └── evaluator.js
│
├── utils/
│   ├── logger.js
│   └── spinner.js
│
└── output/
```

---

# Technologies Used

* Node.js
* JavaScript (ES Modules)
* Google Gemini API (`@google/genai`)
* OpenRouter API
* Axios
* Zod
* Ora
* Chalk
* Dotenv

---

# Installation

## Clone the repository

```bash
git clone https://github.com/princekumar-engineer/self-consistency-cli.git
```

## Navigate to the project

```bash
cd self-consistency-cli
```

## Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

---

# Run the Application

```bash
npm start
```

Development mode:

```bash
npm run dev
```

---

# Example

```text
Enter your question:

Explain Retrieval-Augmented Generation (RAG).
```

---

# Sample Output

```text
================ GEMINI ================

...

================ LLAMA =================

...

================ QWEN ==================

...

========== FINAL SELF-CONSISTENT ANSWER ==========

## Retrieval-Augmented Generation (RAG)

...

Summary

Merged the strongest explanations and corrected inconsistencies.

Strengths

1. Accurate explanation
2. Better organization
3. Clear examples

Confidence: 98%
```

---

# Structured Output

Each AI model returns a validated object using **Zod**.

```json
{
  "provider": "OpenRouter",
  "model": "Qwen 3 30B A3B",
  "answer": "Generated response...",
  "timestamp": "2026-07-17T15:30:10.412Z"
}
```

The evaluator returns structured JSON:

```json
{
  "finalAnswer": "Final synthesized answer in Markdown",
  "summary": "Summary of how the answer was synthesized.",
  "strengths": [
    "Strong factual accuracy",
    "Clear explanation",
    "Well-structured response"
  ],
  "confidence": 0.98
}
```

---

# How It Works

1. The user enters a question in the terminal.
2. The application sends the prompt simultaneously to:

   * Gemini
   * Llama 3.3
   * Qwen
3. Requests execute concurrently using `Promise.allSettled()`.
4. Every response is validated using **Zod**.
5. Successfully validated responses are collected dynamically.
6. Gemini reviews every available response.
7. Gemini:

   * Compares responses
   * Removes duplicate information
   * Corrects mistakes
   * Merges the strongest ideas
   * Produces a polished final answer
8. The synthesized response is displayed in the terminal.
9. All model responses and the final evaluation are saved as a timestamped JSON file inside the `output/` directory.

---

# Error Handling

The application includes:

* Empty input validation
* Provider-specific error handling
* Graceful handling of failed model requests
* Parallel execution with `Promise.allSettled()`
* Runtime validation using Zod
* Structured evaluator fallback
* Timestamped console logging
* Automatic JSON export

---

# Future Improvements

* Add more LLM providers
* Streaming responses
* Conversation history
* Token usage tracking
* Cost estimation
* Interactive chat mode
* Docker support
* React / Next.js web interface
* Model benchmarking
* Response ranking and voting

---

# Author

**Your Name**

---

# License

This project was created for educational purposes as part of the **GenAI with JavaScript 2026** course.
