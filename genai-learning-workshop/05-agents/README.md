# 05 - Agents

> Learn how to build autonomous, stateful AI agents using Google's `@google/genai` SDK. Build custom execution loops using structured JSON outputs, system command guardrails, and the ReAct (Reasoning + Acting) framework (`plan` $\rightarrow$ `action` $\rightarrow$ `observe` $\rightarrow$ `output`).

---

## 📚 Overview

An **AI Agent** extends standard LLM text completions by giving the model access to external capabilities, system state, and tools. Unlike simple single-turn prompts, an agent operates within an iterative control loop: it analyzes input, formulates a plan, requests tool execution, observes execution results, and produces contextually grounded outputs.

```text
 User Request ("What is my current directory and weather in Hyderabad?")
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Agent ReAct Loop                           │
│                                                                     │
│   1. PLAN     ──► Formulate next step                               │
│   2. ACTION   ──► Emit function request (e.g. run_command("pwd"))   │
│   3. OBSERVE  ──► Execute local code/API & feed output back         │
│   4. OUTPUT   ──► Final response to user                            │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                                   ▼
 Final Output ("Your current directory is /app and Hyderabad is 24°C")

```

In this module, you will learn how to build AI agents using system context injection, structured JSON response schemas, system command security guardrails, and continuous terminal-driven ReAct execution loops.

---

## 🎯 Learning Objectives

After completing this module, you will be able to:

* Inject dynamic temporal and localized system context into LLMs
* Constrain model responses to strict structured schemas using `@google/genai` `responseSchema`
* Construct autonomous ReAct agent loops using explicit stages (`plan`, `action`, `observe`, `output`)
* Map JSON action calls directly to executable JS functions, live HTTP APIs, and asynchronous shell commands
* Implement strict security guardrails (allowlisting safe CLI commands) for local shell execution tools
* Maintain multi-turn conversational memory within continuous terminal shell environments

---

## 📁 Project Structure

```text
05-agents/
├── 01-date-time.js
├── 02-weather.js
├── 03-weather-cot.js
├── 04-weather-automate.js
├── 05-weather-agents.js
└── 06-cursor-agent.js

```

---

## 📦 Prerequisites

* Node.js 18+
* Active Gemini API Key configured in `.env` (`GEMINI_API_KEY`)

---

## 📥 Install Dependencies

From the project root:

```bash
npm install @google/genai dotenv

```

---

## ▶️ Running the Examples

### 1. Static Context & System Instructions

```bash
node 05-agents/01-date-time.js

```

### 2. Hardcoded Tool Context Injection

```bash
node 05-agents/02-weather.js

```

### 3. Structured Output & Manual Reasoning

```bash
node 05-agents/03-weather-cot.js

```

### 4. Single-Query Automated ReAct Loop

```bash
node 05-agents/04-weather-automate.js

```

### 5. Multi-Turn Interactive Live Agent Loop

```bash
node 05-agents/05-weather-agents.js

```

### 6. Interactive Cursor Agent with Safe Command Execution

```bash
node 05-agents/06-cursor-agent.js

```

---

# Key Agent Concepts

## 1. System Prompt Context Injection

LLMs cannot directly read system clocks or live internet data without explicit grounding. Injecting computed values—such as formatted dates, times, and default system metadata—into `systemInstruction` gives models accurate local context.

## 2. ReAct Framework (Reasoning & Acting)

The ReAct framework structures agent actions into 4 distinct phases:

1. **Plan**: The model evaluates user intent and determines necessary sub-steps.
2. **Action**: The model requests execution of an external function with specific parameters.
3. **Observe**: The application executes the requested code and feeds the output back into context.
4. **Output**: The model formats and delivers the final answer based on the observed tool outputs.

## 3. Native JSON Schema Enforcement

By passing `responseMimeType: "application/json"` and configuring `responseSchema` with `@google/genai` `Type.OBJECT`, the model's outputs are strictly validated, preventing string parsing errors during execution loops.

## 4. Command Execution Guardrails

Granting an agent access to local system tools (such as shell commands via Node's `child_process`) poses severe security risks if left unrestricted. Using an explicit allowlist (such as a `Set` of allowed command strings) guarantees that the agent cannot run destructive operations on the host machine.

---

# Example Walkthroughs

---

## Example 1 — Dynamic Date & Time Context Injection

**File**: `05-agents/01-date-time.js`

### Overview

Demonstrates how to inject dynamic runtime system info (current date, time, and timezone) into the model's system instructions.

### Code Implementation

```javascript
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

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

```

---

## Example 2 — Hardcoded System Context Injection

**File**: `05-agents/02-weather.js`

### Overview

Illustrates how pre-fetching or hardcoding environmental variables into `systemInstruction` allows models to answer domain-specific questions without requiring complex tool orchestration loops.

### Code Implementation

```javascript
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getWeather(city) {
  return "42°C";
}

const now = new Date();

const date = now.toLocaleDateString("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const time = now.toLocaleTimeString("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const SYSTEM_PROMPT = `
You are a helpful AI Assistant.

Today is ${date} and the time is ${time} IST.

Hyderabad's weather is 24°C.
`;

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  config: {
    systemInstruction: SYSTEM_PROMPT,
  },
  contents: "What is the weather in Hyderabad?",
});

console.log(response.text);

```

---

## Example 3 — Structured Schema Validation & Manual Conversation Steps

**File**: `05-agents/03-weather-cot.js`

### Overview

Uses `Type.OBJECT` schema enforcement combined with pre-populated history context to demonstrate how models parse intermediate ReAct execution stages (`plan` and `action`).

### Code Implementation

```javascript
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getWeather(city) {
  return "42 degrees C";
}

const SYSTEM_PROMPT = `
You are a helpful AI Assistant who specializes in resolving user queries.

You work in the following sequence:
1. plan
2. action
3. observe
4. output

Rules:
- Return exactly one JSON object at a time.
- If an action is needed, specify the function name and input.
- Wait for the observation before producing the final output.

Available Tools:
- get_weather(city): Returns the weather of a city.

JSON Schema:
{
  "step": "string",
  "content": "string",
  "function": "string",
  "input": "string"
}
`;

const contents = [
  {
    role: "user",
    parts: [
      {
        text: `${SYSTEM_PROMPT}\n\nQuestion:\nWhat is the weather in Hyderabad?`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          step: "plan",
          content: "The user wants the weather of Hyderabad. I should use the get_weather tool.",
        }),
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          step: "action",
          function: "get_weather",
          input: "Hyderabad",
        }),
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: JSON.stringify({
          step: "observe",
          content: "24 degrees C",
        }),
      },
    ],
  },
];

const response = await ai.models.generateContent({
  model: "gemini-2.0-flash",
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        step: { type: Type.STRING },
        content: { type: Type.STRING },
        function: { type: Type.STRING },
        input: { type: Type.STRING },
      },
    },
  },
  contents,
});

console.log(JSON.parse(response.text));

```

---

## Example 4 — Automated ReAct Single-Query Execution Loop

**File**: `05-agents/04-weather-automate.js`

### Overview

Automates single-query resolution using a continuous `while(true)` loop. The application interceptively executes tool invocations (`step: "action"`), appends observation responses (`step: "observe"`), and re-triggers the model until a `step: "output"` JSON object is generated.

### Execution Flowchart

```text
               User Enters Query
                       │
                       ▼
           Enter Execution Loop
                       │
                       ▼
           ai.models.generateContent()
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
 step === "plan"               step === "action"
  Log Plan &                    Invoke Local JS Function
  Prompt "Continue."             Feed Observation Object Back
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
               step === "output"
                       │
                       ▼
           Print Result & Terminate

```

### Code Implementation

```javascript
import { GoogleGenAI, Type } from "@google/genai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getWeather(city) {
  return "42 degrees C";
}

const availableTools = {
  get_weather: getWeather,
};

const SYSTEM_PROMPT = `
You are a helpful AI Assistant specialized in resolving user queries.

You work in the following sequence:
1. plan
2. action
3. observe
4. output

Rules:
- Return exactly one JSON object at a time.
- Wait for the observation after an action.
- Follow the JSON schema.

JSON Schema:
{
  "step": "string",
  "content": "string",
  "function": "string",
  "input": "string",
  "output": "string"
}

Available Tools:
- get_weather(city): Returns the weather of the city.
`;

const rl = readline.createInterface({ input, output });

const query = await rl.question("> ");

const contents = [
  {
    role: "user",
    parts: [
      {
        text: `${SYSTEM_PROMPT}\n\nQuestion:\n${query}`,
      },
    ],
  },
];

while (true) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.STRING },
          content: { type: Type.STRING },
          function: { type: Type.STRING },
          input: { type: Type.STRING },
          output: { type: Type.STRING },
        },
      },
    },
    contents,
  });

  const parsed = JSON.parse(response.text);

  contents.push({
    role: "model",
    parts: [{ text: response.text }],
  });

  switch (parsed.step) {
    case "plan":
      console.log("🧠:", parsed.content);
      contents.push({
        role: "user",
        parts: [{ text: "Continue." }],
      });
      break;

    case "action": {
      const toolName = parsed.function;
      const toolInput = parsed.input;

      console.log(`🔨 Calling Tool: ${toolName}("${toolInput}")`);

      const toolOutput = availableTools[toolName]
        ? availableTools[toolName](toolInput)
        : "Tool not found.";

      contents.push({
        role: "user",
        parts: [
          {
            text: JSON.stringify({
              step: "observe",
              output: toolOutput,
            }),
          },
        ],
      });
      break;
    }

    case "output":
      console.log("\n🤖:", parsed.content);
      rl.close();
      process.exit(0);

    default:
      console.log(parsed);
      rl.close();
      process.exit(0);
  }
}

```

---

## Example 5 — Multi-Turn Live Agent with Dynamic Web Calls

**File**: `05-agents/05-weather-agents.js`

### Overview

Implements a production-ready interactive CLI agent. It combines an outer terminal input loop with an inner automated ReAct step loop, utilizing live HTTP requests to `wttr.in` for real-time weather information fetching.

### Code Implementation

```javascript
import { GoogleGenAI, Type } from "@google/genai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import "dotenv/config";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t`
    );

    if (!response.ok) {
      return `Sorry, I couldn't get the weather for ${city}.`;
    }

    const weather = await response.text();
    return `The weather in ${city} is ${weather}.`;
  } catch (error) {
    return `Error fetching weather: ${error.message}`;
  }
}

const availableTools = {
  get_weather: getWeather,
};

const SYSTEM_PROMPT = `
You are a helpful AI Assistant specialized in resolving user queries.

You work in this order:
1. plan
2. action
3. observe
4. output

Rules:
- Return exactly one JSON object.
- Perform only one step at a time.
- Wait for the observation after an action.

Available Tools:
- get_weather(city): Returns the weather of a city.

Output Schema:
{
  "step": "string",
  "content": "string",
  "function": "string",
  "input": "string",
  "output": "string"
}
`;

const rl = readline.createInterface({ input, output });

const contents = [
  {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }],
  },
];

while (true) {
  const query = await rl.question("> ");

  contents.push({
    role: "user",
    parts: [{ text: query }],
  });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING },
            content: { type: Type.STRING },
            function: { type: Type.STRING },
            input: { type: Type.STRING },
            output: { type: Type.STRING },
          },
        },
      },
      contents,
    });

    const parsed = JSON.parse(response.text);

    contents.push({
      role: "model",
      parts: [{ text: response.text }],
    });

    if (parsed.step === "plan") {
      console.log("🧠:", parsed.content);
      contents.push({
        role: "user",
        parts: [{ text: "Continue." }],
      });
      continue;
    }

    if (parsed.step === "action") {
      const toolName = parsed.function;
      const toolInput = parsed.input;

      console.log(`🔨 Calling Tool: ${toolName}("${toolInput}")`);

      let toolOutput = "Tool not found.";
      if (availableTools[toolName]) {
        toolOutput = await availableTools[toolName](toolInput);
      }

      contents.push({
        role: "user",
        parts: [
          {
            text: JSON.stringify({
              step: "observe",
              output: toolOutput,
            }),
          },
        ],
      });
      continue;
    }

    if (parsed.step === "output") {
      console.log("🤖:", parsed.content);
      break;
    }
  }
}

```

---

## Example 6 — Cursor Agent with Safe Shell Command Execution

**File**: `05-agents/06-cursor-agent.js`

### Overview

Demonstrates an extended AI workspace assistant capable of executing limited terminal shell commands alongside web requests. To prevent security vulnerabilities or unwanted side effects, command execution is guarded by an explicit set of safe commands (`pwd`, `ls`, `whoami`).

### Code Implementation

```javascript
import { GoogleGenAI, Type } from "@google/genai";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import "dotenv/config";

const execAsync = promisify(exec);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function getWeather(city) {
  try {
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t`
    );

    if (!response.ok) {
      return `Couldn't fetch weather for ${city}`;
    }

    const weather = await response.text();
    return `The weather in ${city} is ${weather}.`;
  } catch (err) {
    return err.message;
  }
}

// Allow only a few safe commands
const SAFE_COMMANDS = new Set([
  "pwd",
  "ls",
  "whoami",
]);

async function runCommand(command) {
  if (!SAFE_COMMANDS.has(command.trim())) {
    return "Command not allowed.";
  }

  try {
    const { stdout } = await execAsync(command);
    return stdout.trim();
  } catch (err) {
    return err.message;
  }
}

const availableTools = {
  get_weather: getWeather,
  run_command: runCommand,
};

const SYSTEM_PROMPT = `
You are a helpful AI assistant.

You operate in this sequence:

plan
action
observe
output

Available tools:

- get_weather(city)
- run_command(command)

Always return JSON.
`;

const contents = [
  {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT }],
  },
];

const rl = readline.createInterface({
  input,
  output,
});

while (true) {
  const question = await rl.question("> ");

  contents.push({
    role: "user",
    parts: [{ text: question }],
  });

  while (true) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",

      config: {
        responseMimeType: "application/json",

        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING },
            content: { type: Type.STRING },
            function: { type: Type.STRING },
            input: { type: Type.STRING },
            output: { type: Type.STRING },
          },
        },
      },

      contents,
    });

    const result = JSON.parse(response.text);

    contents.push({
      role: "model",
      parts: [{ text: response.text }],
    });

    if (result.step === "plan") {
      console.log("🧠", result.content);

      contents.push({
        role: "user",
        parts: [{ text: "Continue." }],
      });

      continue;
    }

    if (result.step === "action") {
      console.log(
        `🔨 Calling ${result.function}("${result.input}")`
      );

      let observation = "Tool not found.";

      if (availableTools[result.function]) {
        observation = await availableTools[result.function](
          result.input
        );
      }

      contents.push({
        role: "user",
        parts: [
          {
            text: JSON.stringify({
              step: "observe",
              output: observation,
            }),
          },
        ],
      });

      continue;
    }

    if (result.step === "output") {
      console.log("🤖", result.content);
      break;
    }
  }
}

```

---

## 📌 Expected Terminal Output

```text
> Who am I and where am I running this process?
🧠 I will use run_command to check the logged in user and current directory.
🔨 Calling run_command("whoami")
🧠 Next, I will check the working directory.
🔨 Calling run_command("pwd")
🤖 You are running as user 'devuser' in directory '/Users/developer/projects/05-agents'.
>

```

---

## 🧠 Key Concepts Covered

### 1. ReAct Loop Control

Decoupling reasoning from output generation lets developer-controlled code interject between LLM decision steps to execute tasks, enforce permissions, or log actions.

### 2. Schema-Enforced Structural Outputs

Configuring `responseSchema` forces Gemini to output structured JSON matching your exact type definition, preventing broken client logic caused by unstructured response formats.

### 3. Tool Dispatching & Security Sandboxing

Using dynamic lookup dictionaries (`availableTools[toolName]`) maps JSON string action names directly to native JavaScript functions. Enforcing strict set validation (`SAFE_COMMANDS.has(...)`) ensures system tools cannot execute unauthorized commands or shell injections.

---

# 📝 Notes & Best Practices

* **Prevent Infinite Loops**: Always implement a maximum iteration guard (e.g., `maxSteps = 10`) inside `while(true)` loops to prevent runaway API requests when models encounter ambiguous instructions.
* **Error Handling in Tools**: Wrap external HTTP calls and tool functions in `try...catch` blocks and pass error messages back into the observation step (`step: "observe"`) so the agent can adapt gracefully.
* **Command Shell Guardrails**: Never allow unchecked LLM inputs to be passed straight to shell invocation functions like `exec()`. Always employ input validation or explicit allowlists.
* **Context Management**: For long-running multi-turn terminal sessions, prune intermediate `plan` and `observe` steps from `contents` to optimize token consumption and maintain prompt efficiency.