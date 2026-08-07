# 00 - SDK Tutorials

> Learn how to interact with leading Large Language Models (LLMs) using their official JavaScript SDKs. This module introduces the OpenAI, Google Gemini, and Anthropic Claude SDKs, along with structured outputs and streaming responses.

---

## 📚 Overview

Modern AI providers offer official SDKs that simplify interacting with their models. Although each provider has its own SDK, they all follow a similar workflow:

```text
Initialize Client
        ↓
Authenticate
        ↓
Choose Model
        ↓
Send Prompt
        ↓
Receive Response
        ↓
Process Output

```

In this module, you'll build a strong foundation by learning how to communicate with different LLM providers before moving on to tokenization, embeddings, Retrieval-Augmented Generation (RAG), and AI Agents.

---

## 🎯 Learning Objectives

After completing this module, you will be able to:

* Configure API keys using environment variables
* Use the Anthropic Claude SDK
* Use the Google Gemini SDK
* Use the OpenAI SDK
* Handle multi-modal content blocks from responses
* Generate structured JSON outputs enforced by Zod schemas
* Stream AI responses in real-time to stdout
* Identify common architectural patterns across different provider SDKs

---

## 📁 Project Structure

```text
00-sdk-tutorials/
├── claude-sdk.js
├── gemini-sdk.js
├── openai-sdk.js
└── openai-streaming.js

```

---

## 📦 Prerequisites

* Node.js 18+
* npm
* Internet connection
* API Keys for OpenAI, Google Gemini, and Anthropic Claude

---

## 🔑 Environment Variables

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

```

Never commit your `.env` file to version control.

---

## 📥 Install Dependencies

From the project root, install the necessary dependencies:

```bash
npm install @anthropic-ai/sdk @google/genai openai zod dotenv

```

---

## ▶️ Running the Examples

### Claude SDK

```bash
node 00-sdk-tutorials/claude-sdk.js

```

---

### Gemini SDK

```bash
node 00-sdk-tutorials/gemini-sdk.js

```

---

### OpenAI Structured Output

```bash
node 00-sdk-tutorials/openai-sdk.js
```

---

### OpenAI Streaming

```bash
node 00-sdk-tutorials/openai-streaming.js
```

---

# Example 1 — Anthropic Claude SDK

**File**

```
claude-sdk.js
```

### Overview

This example demonstrates how to communicate with Anthropic's Claude model using `@anthropic-ai/sdk`.

The application:

* Instantiates an `Anthropic` client passing the `ANTHROPIC_API_KEY`
* Calls `client.messages.create()` with a prompt asking to explain JavaScript promises
* Iterates over the resulting response content blocks to extract and print text blocks

---

### Code Implementation

```javascript
import 'dotenv/config';
import { Anthropic } from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function main() {
  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Explain JavaScript promises.',
        },
      ],
    });

    for (const block of response.content) {
      if (block.type === 'text') {
        console.log(block.text);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

main();
```

---

### Workflow

```text
User Prompt ("Explain JavaScript promises")
              │
              ▼
    Anthropic Client Initialization
              │
              ▼
  client.messages.create() API Call
              │
              ▼
   Claude Opus Model Processing
              │
              ▼
 Array of Response Content Blocks Returned
              │
              ▼
    Filter & Print 'text' Blocks
```

---

### What You'll Learn

* Initializing the `@anthropic-ai/sdk` client safely using environment variables
* Structuring request payloads with system roles and `max_tokens` limits
* Handling content block arrays returned by multi-modal/block-based API responses

---

# Example 2 — Google Gemini SDK

**File**

```
gemini-sdk.js
```

### Overview

This example demonstrates using Google's official `@google/genai` SDK to run basic text generation queries.

The application:

* Initializes the `GoogleGenAI` client using `GEMINI_API_KEY`
* Calls `ai.models.generateContent()` asking for an explanation of JavaScript `async/await`
* Extracts and logs `response.text` directly to the console

---

### Code Implementation

```javascript
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
```

---

### Workflow

```text
Prompt ("Explain JavaScript async/await...")
              │
              ▼
    GoogleGenAI Client Init
              │
              ▼
ai.models.generateContent() API Call
              │
              ▼
   Gemini 2.5 Flash Processing
              │
              ▼
 Direct String Access via response.text
```

---

### What You'll Learn

* Instantiating the official `@google/genai` client
* Prompting high-efficiency models like `gemini-2.5-flash`
* Accessing shorthand property responses (`response.text`)

---

# Example 3 — OpenAI Structured Outputs

**File**

```
openai-sdk.js
```

### Overview

Instead of parsing unstructured freeform text, OpenAI allows forcing response structures using strict Zod schemas and helper utilities.

This example analyzes an unformatted text document, identifies risks, scores them, and outputs a strictly typed JSON object matching a Zod target schema.

---

### Code Implementation

```javascript
import 'dotenv/config';

import OpenAI from 'openai';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';

const client = new OpenAI();

const RiskSchema = z.object({
  title: z.string().describe('The actual title for the risk'),
  tags: z.array(z.string()).describe('3-4 tags for this risk'),
  score: z.number().min(1).max(5).describe('Risk level out of 5'),
});

const outputSchema = z.object({
  risks: z.array(RiskSchema).describe('Array of risks'),
});

async function init() {
  try {
    const result = await client.responses.parse({
      model: 'gpt-4.1-mini',
      text: {
        format: zodTextFormat(outputSchema, 'risks'),
      },
      input: `
Extract the risks from the following document.

Document:
Our company recently launched a new software platform.
The platform relies on several third-party APIs that may experience downtime.
In addition, we are storing customer data in the cloud, and there are strict
regulatory requirements regarding data privacy and protection.
Some features are still in beta and could potentially introduce bugs
that affect user experience.

Please list any risks you find in the document above.
`,
    });

    console.log(result.output_parsed);
  } catch (error) {
    console.error('Error:', error);
  }
}

init();
```

---

### Workflow

```text
Input Document Text
        │
        ▼
Define Zod Schema (outputSchema)
        │
        ▼
client.responses.parse() + zodTextFormat()
        │
        ▼
GPT-4.1 Mini Model Extraction
        │
        ▼
Validated JavaScript Object (result.output_parsed)
```

---

### Sample Output

```json
{
  "risks": [
    {
      "title": "Third-Party API Downtime",
      "tags": ["API", "Downtime", "Dependencies"],
      "score": 4
    },
    {
      "title": "Data Privacy and Regulatory Non-Compliance",
      "tags": ["Compliance", "Privacy", "Data Storage"],
      "score": 5
    },
    {
      "title": "Beta Feature Software Bugs",
      "tags": ["Software", "Bugs", "User Experience"],
      "score": 3
    }
  ]
}
```

---

### Why Structured Outputs?

Relying on string manipulation or `JSON.parse()` on unstructured model text often leads to runtime errors when model output drifts. Using structured outputs guarantees:

* Automatic type validation against your Zod definitions
* Guaranteed standard JSON schema compliance without markdown wrapping blocks
* Seamless ingestion into databases, backend APIs, or downstream automated services

---

# Example 4 — OpenAI Streaming

**File**

```
openai-streaming.js

```

### Overview

This example demonstrates how to stream output tokens incrementally as they are synthesized by the model using Server-Sent Events (SSE).

---

### Code Implementation

```javascript
import 'dotenv/config';

import OpenAI from 'openai';

const client = new OpenAI();

async function init() {
  try {
    const stream = await client.responses.create({
      model: 'gpt-5.5',
      input: [
        {
          role: 'user',
          content: 'Tell me the story and summary of Little Red Riding Hood.',
        },
      ],
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        process.stdout.write(event.delta);
      }
    }

    console.log(); // Move to the next line after streaming finishes
  } catch (error) {
    console.error('Error:', error);
  }
}

init();

```

---

### Workflow

```text
User Request
     │
     ▼
client.responses.create({ stream: true })
     │
     ▼
OpenAI SSE Response Stream
     │
     ▼
Async Iterator Loop (for await...of)
     │
     ▼
Filter event.type === 'response.output_text.delta'
     │
     ▼
Write event.delta directly to process.stdout

```

---

### Benefits

* **Reduced Perceived Latency**: Content displays to the user instantly as it generates.
* **Improved UX**: Provides an interactive typing experience identical to ChatGPT interfaces.
* **Resource Efficient**: Process text chunks dynamically without waiting for full context completion in memory.

---

## 📊 SDK Comparison

| Feature | OpenAI (`openai`) | Google Gemini (`@google/genai`) | Anthropic (`@anthropic-ai/sdk`) |
| --- | --- | --- | --- |
| **Primary Class** | `OpenAI` | `GoogleGenAI` | `Anthropic` |
| **Default Env Variable** | `OPENAI_API_KEY` | `GEMINI_API_KEY` | `ANTHROPIC_API_KEY` |
| **Text Generation Method** | `client.responses.create()` / `client.chat.completions.create()` | `ai.models.generateContent()` | `client.messages.create()` |
| **Streaming Support** | Async Iterators (`stream: true`) | Async Iterators (`generateContentStream`) | Async Iterators (`stream: true`) |
| **Structured Output** | Native (`zodTextFormat` / `response_format`) | Native Schema (`responseSchema`) | Tool Calling / Schema |
| **Primary Output Format** | Text Delays / Parsed Objects | Text Property / Candidates Array | Array of Content Blocks |

---

## 🧠 Key Concepts Covered

* **Environment Variable Abstraction**: Keeping API credentials secure using `dotenv`.
* **SDK Instantiation**: Uniform setup procedures across different model vendors.
* **Async Execution**: Non-blocking network I/O handling via native `async/await`.
* **Structured Schema Formatting**: Forcing models to strictly adhere to Zod object models.
* **Real-Time Token Streaming**: Consuming standard input streams using async iteration over delta updates.
* **Error Interception**: Wrapping API requests in standard `try...catch` blocks for robust execution.

---

## 📌 Expected Output

When running each script in the terminal, you should observe:

1. **`claude-sdk.js`**: Text block output printed in the console explaining JavaScript promises.
2. **`gemini-sdk.js`**: Formatted text explanation of JavaScript `async/await` with code snippets.
3. **`openai-sdk.js`**: A clean, parsed JavaScript Object listing risks, tags, and severity scores extracted from the prompt.
4. **`openai-streaming.js`**: Real-time word-by-word streaming text printed to standard output telling the story of Little Red Riding Hood.

---

# 📝 Notes

## 1. Never Hardcode API Keys

❌ Bad

```javascript
const client = new OpenAI({
  apiKey: "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
});

```

✅ Good

```env
OPENAI_API_KEY=your_api_key

```

```javascript
import 'dotenv/config';
const client = new OpenAI(); // Automatically reads process.env.OPENAI_API_KEY

```

---

## 2. Load Environment Variables Early

Ensure `import 'dotenv/config'` or `dotenv.config()` is called at the top of your main entry file before constructing any SDK clients.

---

## 3. API Calls are Asynchronous

Every model call sends network requests over HTTPS. Always use `await` inside an `async` function when calling SDK generation endpoints.

---

## 4. Handle Content Types Safely

Anthropic responses structure output as an array of content blocks (e.g., text, tool calls). Always inspect `block.type` before accessing properties:

```javascript
for (const block of response.content) {
  if (block.type === 'text') {
    console.log(block.text);
  }
}

```

---

## 5. Standardize Output with Schemas

When using LLM outputs programmatically within application logic, always use Structured Output mechanisms (e.g., Zod formatting in OpenAI) to avoid unpredictable JSON parsing errors.

---

## 6. Stream Interactive Responses

For long-form generations (e.g., summaries, code generation, creative writing), use streaming mode to deliver content to end users incrementally, drastically reducing perceived latency.

---

# ⚠️ Common Mistakes

* Forgetting to invoke `import 'dotenv/config'` resulting in `undefined` API key errors.
* Accidentally pushing `.env` files containing active secret keys to GitHub.
* Omitting `await` when calling asynchronous SDK functions.
* Attempting to access non-existent string properties on block-based SDK outputs.
* Not providing clear descriptions inside Zod schema fields when building structured prompts.

---

# 💡 Best Practices

* Standardize environment key names across environments (`OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`).
* Define explicit validation schemas using libraries like Zod when extracting structured data.
* Wrap all model invocations inside `try...catch` blocks to cleanly handle rate limits or API outage errors.
* Use smaller, faster models (`gpt-4.1-mini`, `gemini-2.5-flash`) for structural tasks or low-latency operations.

