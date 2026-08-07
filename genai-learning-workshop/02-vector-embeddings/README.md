# 02 - Vector Embeddings

> Learn how to convert unstructured text into high-dimensional numerical vectors (embeddings) using Google's `@google/genai` SDK and inspect embedding dimensionality for semantic search and retrieval systems.

---

## 📚 Overview

Vector embeddings are dense floating-point numerical representations of text. Unlike simple token IDs, embeddings capture deep **semantic relationships** between words and sentences. Texts with similar conceptual meanings yield vectors that lie close to each other in high-dimensional vector space, even if they share no exact words.

```text
Unstructured Text ("dog chases cat")
                 │
                 ▼
    GoogleGenAI Embedding API
                 │
                 ▼
  gemini-embedding-001 Model
                 │
                 ▼
 High-Dimensional Floating Point Vector ([0.012, -0.045, 0.812, ...])
                 │
                 ▼
 Vector Store / Distance Query (Cosine Similarity / Euclidean)

```

In this module, you will learn how to generate text embeddings using Google's official `gemini-embedding-001` model, extract vector arrays, and measure vector dimensions.

---

## 🎯 Learning Objectives

After completing this module, you will be able to:

* Initialize Google's `@google/genai` SDK for embedding tasks
* Request high-dimensional vector representations using `ai.models.embedContent()`
* Select specialized embedding models like `gemini-embedding-001`
* Extract raw float arrays and inspect output vector dimensions
* Understand how vector length impacts downstream storage and vector databases (e.g., Qdrant, Pinecone)

---

## 📁 Project Structure

```text
02-vector-embeddings/
└── index.js

```

---

## 📦 Prerequisites

* Node.js 18+
* Active Google Gemini API Key configured inside `.env`

---

## 📥 Install Dependencies

From the project root:

```bash
npm install @google/genai dotenv

```

---

## ▶️ Running the Example

```bash
node 02-vector-embeddings/index.js

```

---

# Example — Generating Embeddings with Google Gemini SDK

**File**

```text
02-vector-embeddings/index.js

```

### Overview

This example demonstrates how to generate a dense vector embedding for the string `"dog chases cat"` using Google's `gemini-embedding-001` model. It extracts the resulting array of floating-point numbers and calculates the exact vector dimension count.

---

### Code Implementation

```javascript
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// console.log(process.env.GEMINI_API_KEY);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const text = "dog chases cat";

async function generateEmbedding() {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    console.log("Vector Embeddings:", response);

    // Number of dimensions in the embedding vector
    console.log(
      "Length:",
      response.embeddings[0].values.length
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

generateEmbedding();

```

---

### Workflow

```text
Input Text ("dog chases cat")
              │
              ▼
   ai.models.embedContent()
              │
              ▼
  Model: gemini-embedding-001
              │
              ▼
 Response Object with embeddings Array
              │
              ▼
  response.embeddings[0].values
              │
              ▼
 Print Vector Values & Dimension Count (3072)

```

---

### What You'll Learn

* **SDK Vector Generation**: Calling `embedContent()` to convert arbitrary text strings into vector formats.
* **Model Selection**: Using specialized embedding models (`gemini-embedding-001`) optimized for semantic retrieval over generative tasks.
* **Vector Dimension Verification**: Inspecting `values.length` to ensure your target vector database collection schema matches the model's default vector length (3072 dimensions).

---

## 📌 Expected Output

Running `node 02-vector-embeddings/index.js` outputs an object containing the embedding response structure followed by the dimension count:

```text
Vector Embeddings: {
  embeddings: [
    {
      values: [
        0.0124821, -0.0381023, 0.0049210, ...
      ]
    }
  ]
}
Length: 3072

```

---

## 🧠 Key Concepts Covered

### 1. High-Dimensional Spatial Representation

Embeddings project natural language into $N$-dimensional space. Sentences with similar meanings (e.g., *"dog chases cat"* and *"canine pursues feline"*) produce vectors that point in nearly identical spatial directions, yielding high cosine similarity scores despite having no matching vocabulary words.

### 2. Output Dimensionality

By default, `gemini-embedding-001` returns a **3072-dimensional vector**. Each dimension represents an abstract, learned semantic feature.

### 3. Use Cases for Embeddings

* **Semantic Search**: Finding relevant documents based on concept rather than keyword matching.
* **RAG Systems**: Indexing chunked document segments into vector databases to inject as context into LLM prompts.
* **Recommendation & Clustering**: Grouping related text assets by spatial distance.

---

# 📝 Notes & Best Practices

* **Match Collection Schemas**: When configuring vector stores (such as Qdrant or Pinecone), set your collection dimension configuration to match the exact size generated by your model (e.g., `3072` for `gemini-embedding-001`).
* **Symmetric Model Embedding**: Ensure that both query strings and stored document chunks are processed using the exact same embedding model to ensure coordinate alignment in vector space.
* **Error Handling**: Wrap embedding calls in standard `try...catch` blocks to protect against network errors or invalid API key exceptions.

