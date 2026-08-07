# 03 - Hello World

> Learn core conversation mechanics with Large Language Models, including multi-turn chat dynamics, handling model statelessness, and providing conversational context using `@google/genai`.

---

## 📚 Overview

Large Language Model API endpoints are fundamentally **stateless**. Every incoming API request is isolated and evaluated in complete independence; the model does not natively remember previous calls, user identities, or previous messages unless prior context is explicitly included in the request payload.

```text
User Request ("What's my name?") ────────┐
                                         ├─► Isolated Call ──► LLM Output ("I don't know.")
No History Passed                        │
                                         ┘

User History Array                       ┐
  - "My name is Prince" (User)           │
  - "Hi Prince!" (Model)                 ├─► Multi-Turn Call ──► LLM Output ("Your name is Prince.")
  - "What's my name?" (User)             │
                                         ┘

```

In this module, you will explore basic completion calls, observe stateless behavior firsthand, and implement contextual history using Google's `gemini-2.5-flash` model.

---

## 🎯 Learning Objectives

After completing this module, you will be able to:

* Execute basic single-turn chat completion requests
* Understand the stateless nature of LLM API interactions
* Construct multi-turn message arrays using `user` and `model` role structures
* Pass conversation context and chat history to maintain state across interactions

---

## 📁 Project Structure

```text
03-hello-world/
└── chat.js

```

---

## 📦 Prerequisites

* Node.js 18+
* Active Gemini API key configured inside `.env`

---

## 📥 Install Dependencies

From the project root:

```bash
npm install @google/genai dotenv

```

---

## ▶️ Running the Example

```bash
node 03-hello-world/chat.js

```

---

# Example — Statelessness vs. Contextual History

**File**

```text
03-hello-world/chat.js

```

### Overview

This example demonstrates how to maintain conversation state with Google Gemini models. It shows how separate API calls fail to retain context automatically and illustrates how passing an array of turn objects (`role: "user"` / `role: "model"`) enables the model to recall past context, such as the user's name.

---

### Code Implementation

```javascript
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
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

```

---

### Workflow

```text
       Construct Context Payload
 ┌───────────────────────────────────┐
 │ Role: user  -> "My name is Prince"│
 │ Role: model -> "Hi Prince!..."    │
 │ Role: user  -> "What's my name?"  │
 │ Role: model -> "Your name is..."  │
 │ Role: user  -> "How are you?"     │
 └─────────────────┬─────────────────┘
                   │
                   ▼
      ai.models.generateContent()
                   │
                   ▼
       gemini-2.5-flash Execution
                   │
                   ▼
 Prints Contextually Relevant Response

```

---

### What You'll Learn

* **Stateless Nature**: Observing how successive independent API requests do not share memory space or execution context.
* **Message Framing**: Formally defining turns using `role: "user"` and `role: "model"`.
* **Parts Structure**: Passing structured arrays containing `parts: [{ text: "..." }]` to accommodate standard textual turns or multi-modal blocks.

---

## 📌 Expected Output

Running `node 03-hello-world/chat.js` produces a contextual response based on the conversation history array provided:

```text
I'm doing well, thank you for asking! How are you doing today, Prince?

```

---

## 🧠 Key Concepts Covered

### 1. Model Statelessness

API servers serving LLMs evaluate each payload from scratch. The model generates tokens using exclusively what is present in the current prompt context window.

### 2. Multi-Turn Roles

To simulate a multi-turn conversation, past messages are aggregated into an ordered array using standard roles:

* `user`: Messages originating from the human user.
* `model`: Messages generated previously by the model.

### 3. Real-Time Data Constraints

Standard LLM instances lack live real-time web execution capabilities unless supplemented by external tool definitions, dynamic Web Search Grounding, or custom function calls.

---

# 📝 Notes & Best Practices

* **Manage Context Window Limits**: Including past conversation history increases token usage. For long chats, implement dynamic context truncation or summarization strategies.
* **Strict Role Alternation**: Keep role sequences strictly ordered (`user` $\rightarrow$ `model` $\rightarrow$ `user`) to maintain optimal conversation behavior.

