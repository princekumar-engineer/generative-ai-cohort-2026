# Agent SDK Proof of Concept

A lightweight TypeScript framework for building structured, step-by-step LLM agents using a custom reasoning pipeline harness and interceptor pattern.

---

## Overview

This SDK enforces a deterministic reasoning pipeline on top of standard OpenAI models (`gpt-4o`). Instead of relying on standard text completion or native function calling, the agent operates in an explicit loop driven by structured JSON steps parsed from model responses.

```
┌────────┐     ┌────────┐     ┌──────────────┐     ┌─────────┐     ┌────────┐
│ INITIAL│ ──> │ THINK  │ ──> │ TOOL_REQUEST │ ──> │ ANALYSE │ ──> │ OUTPUT │
└────────┘     └────────┘     └──────────────┘     └─────────┘     └────────┘
                  ▲                                     │
                  └─────────────────────────────────────┘
```

---

## Project Structure

```text
agent-sdk-poc-main/
├── src/
│   ├── app/
│   │   ├── agent.ts       # Core Agent & Builder classes with interceptor and execution loop
│   │   └── config.ts      # Harness prompt defining the structured pipeline rules
│   └── index.ts           # Sample entry point defining custom tools and running queries
├── .env.example           # Environment configuration template
├── .env                   # Local environment variables (git-ignored)
├── hello.cpp              # Sample C++ source generated/managed via CLI execution tools
├── package.json           # Dependencies and module setup
├── package-lock.json
└── tsconfig.json          # TypeScript configuration
```

---

## Technical Harness Architecture & Implementation Notes

### 1. The Harness Pipeline

The reasoning strategy is controlled by `HARNESS_PROMPT` in `config.ts`. The prompt forces the LLM to output one JSON step at a time, creating a verifiable chain-of-thought process:

| Pipeline Step | Description |
| --- | --- |
| **`INITIAL`** | Evaluates and decomposes the initial user query. |
| **`THINK`** | Formulates logical steps and determines required tools or actions. |
| **`TOOL_REQUEST`** | Invokes an agent tool. Emits target `functionName` and `input`. |
| **`ANALYSE`** | Inspects tool outputs or interim steps to ensure correct progression. |
| **`OUTPUT`** | Emits the final result and terminates the execution loop. |

### 2. Output Schema Enforcement

Every LLM turn must return a strictly formatted JSON string matching the following schema:

```json
{
  "step": "INITIAL | THINK | TOOL_REQUEST | ANALYSE | OUTPUT",
  "text": "<Thought process or final answer>",
  "functionName": "<Optional: Tool name to call>",
  "input": "<Optional: Input argument for tool call>"
}
```

### 3. Execution Loop & Tool Execution

* **Loop Control**: The runtime loop in `Agent.run()` is capped at `30` iterations (`MAX_LOOP`) to avoid runaway recursion.
* **Developer Role Feedback**: Tool outputs are injected back into the chat history using the `'developer'` role, prompting the model to enter an `ANALYSE` or `THINK` phase in the next iteration.
* **Interceptor Pattern**: The SDK provides an `attachInterceptor` event listener that streams each `IMessage` turn (`assistant` reasoning steps or `developer` tool outputs) to external loggers or visualizers in real time.
---

## Setup & Configuration

### Prerequisites

* Node.js v18+
* NPM or Yarn

### 1. Installation

Install project dependencies:

```bash
npm install
```

### 2. Environment Setup (`.env`)

1. Install `dotenv` to handle environment variables automatically:
```bash
npm install dotenv
```


2. Create a `.env` file in the root directory of your project:
```bash
touch .env
```


3. Add your OpenAI API key to the `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key_here
```


4. Ensure your code imports `dotenv/config` at the entry point (`src/index.ts` or `src/app/agent.ts`):
```typescript
import 'dotenv/config';
```


5. Update `src/app/agent.ts` to read the key dynamically:
```typescript
this.openai = new Openai({
  apiKey: process.env.OPENAI_API_KEY || ''
});
```



---

## Usage Example

The example in `src/index.ts` demonstrates how to create custom tools (a live CLI command executor and a weather API tool) and build specialized agent instances:

```typescript
import 'dotenv/config'; // Loads variables from .env file
import { Agent } from './app/agent.js';
import type { ITool } from './app/agent.js';
import axios from 'axios';
import { exec } from 'child_process';

// 1. Define custom tools
const weatherTool: ITool = {
  name: 'fetchWeatherInfo',
  description: 'Fetches realtime weather data by cityname',
  doc: 'fetchWeatherInfo(cityName: string): WeatherReport',
  async executor(cityName) {
    const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: 'text' });
    return JSON.stringify({ cityName, weatherInfo: response.data });
  },
};

const cliAccessTool: ITool = {
  name: 'execCli',
  description: 'Runs a CLI command on users machine and returns output',
  doc: 'execCli(cli: string): CLIResponse',
  executor(cmd) {
    return new Promise((res) => {
      exec(cmd, (err, out) => {
        if (err) return res(`There was an Error ${err}`);
        return res(out);
      });
    });
  }
};

// 2. Instantiate and run an agent
async function init() {
  const codingAgent: Agent = Agent.builder()
    .setIntructions('You are an expert coding agent')
    .tool(cliAccessTool)
    .build();

  // Attach a real-time message logger
  codingAgent.attachInterceptor((message) => {
    console.log(`[${message.role.toUpperCase()}]: ${message.content}`);
  });

  // Example task: generate a C++ file locally using the CLI tool
  const history = await codingAgent.run(
    'can you build a simple hello world program in c++ on my current project as hello.cpp'
  );

  console.log('Final Execution State:', history?.[history.length - 1]);
}

init();
```

---

## Key Interfaces

### `ITool`

Defines an agent-executable tool.

```typescript
export interface ITool {
  name: string;
  description: string;
  doc?: string;
  executor: (input: string) => Promise<string>;
}
```

### `IMessage`

Represents messages in the agent history stream.

```typescript
export interface IMessage {
  role: 'user' | 'assistant' | 'developer';
  content: string;
}
```

### `Interceptor`

A callback function signature for listening to real-time agent pipeline updates.

```typescript
export type Interceptor = (message: IMessage) => void;
```

---

## Recommended Improvements & Safeguards

1. **Robust JSON Parsing**: Wrap `JSON.parse(rawLLMResponse)` in `agent.ts` with a `try/catch` block to handle instances where the model returns invalid JSON, returning a repair system instruction back to the model.
2. **CLI Sandboxing**: The `execCli` tool grants unconstrained shell access. Consider restricting executable commands or running commands within a sandboxed container.
3. **Git Hygiene**: Add `.env` to your `.gitignore` file to prevent committing API keys to source control.

