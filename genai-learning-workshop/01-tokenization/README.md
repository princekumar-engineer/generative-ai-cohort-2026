# 01 - Tokenization

> Learn how Large Language Models process text by converting raw string data into numerical tokens and decoding token sequences back into human-readable text using Byte-Pair Encoding (BPE) with `tiktoken`.

---

## 📚 Overview

Large Language Models (LLMs) do not process raw text or strings directly. Instead, text is split into smaller units called **tokens**—which can be words, subwords, punctuation, or spaces—and mapped to numerical IDs based on a model-specific vocabulary.

```text
Raw Text String ("Hello, I am PRINCE")
                 │
                 ▼
     Tokenizer / BPE Encoder
                 │
                 ▼
 Array of Token IDs ([13225, 11, 357, 939, ...])
                 │
                 ▼
          LLM Processing
                 │
                 ▼
 BPE Decoder (Array Buffer -> Text)
                 │
                 ▼
 Human-Readable Text ("Hello, I am PRINCE")

```

In this module, you will learn how tokenization works under the hood using OpenAI's official `tiktoken` library, how to encode strings into token IDs, decode token arrays back into text, and manage memory effectively in JavaScript environments.

---

## 🎯 Learning Objectives

After completing this module, you will be able to:

* Understand Byte-Pair Encoding (BPE) and subword tokenization
* Load model-specific tokenizers (e.g., `gpt-4o`) using `tiktoken`
* Convert text strings into arrays of numerical token IDs (`encode`)
* Decode token arrays back into human-readable strings (`decode`)
* Calculate token counts to estimate context window consumption and API costs
* Properly manage WebAssembly (WASM) memory resources using `encoder.free()`

---

## 📁 Project Structure

```text
01-tokenization/
└── index.js

```

---

## 📦 Prerequisites

* Node.js 18+
* `tiktoken` package installed in `package.json`

---

## 📥 Install Dependencies

From the project root:

```bash
npm install tiktoken

```

---

## ▶️ Running the Example

```bash
node 01-tokenization/index.js

```

---

# Example — BPE Encoding and Decoding with `tiktoken`

**File**

```text
01-tokenization/index.js

```

### Overview

This example demonstrates how to perform two-way token transformation using `tiktoken`:

1. **Encoding**: Converts a string `"Hello, I am PRINCE"` into an array of integer token IDs using the `gpt-4o` vocabulary model.
2. **Decoding**: Takes an array of token integers `[13225, 11, 357, 939, 1689, 380, 115904]` and reconstructs the original text using `TextDecoder`.
3. **Memory Cleanup**: Calls `encoder.free()` to release WASM context memory.

---

### Code Implementation

```javascript
import { encoding_for_model } from "tiktoken";

const encoder = encoding_for_model("gpt-4o");

const text = "Hello, I am PRINCE";
const tokens = encoder.encode(text);

console.log("Tokens:", Array.from(tokens));

const tokenArray = [13225, 11, 357, 939, 1689, 380, 115904];
const decoded = encoder.decode(tokenArray);

console.log("Decoded Text:", new TextDecoder().decode(decoded));

// Free resources when done
encoder.free();

```

---

### Workflow

```text
Input Text ("Hello, I am PRINCE")
              │
              ▼
   encoding_for_model("gpt-4o")
              │
              ▼
    encoder.encode(text)
              │
              ▼
   Uint32Array of Token IDs
              │
              ▼
  encoder.decode(tokenArray)
              │
              ▼
  Uint8Array Buffer Byte Stream
              │
              ▼
 TextDecoder().decode(decoded)
              │
              ▼
       Console Output

```

---

### What You'll Learn

* **Model Mapping**: Selecting the exact tokenizer rule matching your target model (`gpt-4o`, `gpt-4`, `gpt-3.5-turbo`).
* **Typed Arrays**: Handling `Uint32Array` output from `encode()` and converting to JavaScript arrays using `Array.from()`.
* **Byte Decoding**: Decoding binary token arrays via `TextDecoder` to cleanly preserve UTF-8 character encoding.
* **Resource Management**: Preventing WebAssembly memory leaks by freeing encoder instances.

---

## 📌 Expected Output

Running `node 01-tokenization/index.js` outputs the following:

```text
Tokens: [ 13225, 11, 357, 939, 1689, 380, 115904 ]
Decoded Text: Hello, I am PRINCE

```

---

## 🧠 Key Concepts Covered

### 1. What is Byte-Pair Encoding (BPE)?

BPE is an iterative subword tokenization algorithm. Common words (like `"Hello"`) get a single token ID, while rare words, uppercase words, or complex names (like `"PRINCE"`) are broken into smaller subword chunks or character combinations.

### 2. Token Ratio & Cost Estimation

* On average, 1 token ≈ 4 characters or 0.75 words in English.
* Code snippets, non-English text, and special symbols usually consume significantly more tokens per character.
* API pricing and model context limits (e.g., 128k context) are calculated strictly by token count, not character count or word count.

### 3. WebAssembly (WASM) Memory Lifecycle

Because `tiktoken` relies on compiled Rust WebAssembly bindings under the hood, calling `encoder.free()` is essential when creating multiple encoders in long-running applications to clear allocated heap memory.

---

# 📝 Notes & Best Practices

* **Match Model to Encoder**: Always use `encoding_for_model("your-model-name")` so token counts match what the API server calculates.
* **Always Clean Up in Loops**: If constructing tokenizer instances dynamically inside request handlers, ensure `encoder.free()` is called in a `finally` block.
* **Context Window Guardrails**: Use `tokens.length` prior to calling API endpoints to prune or truncate long context histories before hitting context window errors.
