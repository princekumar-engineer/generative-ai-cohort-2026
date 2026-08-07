# 04 - Prompting

> Master fundamental to advanced prompt engineering techniques—from basic Zero-Shot and Few-Shot learning to manual Chain-of-Thought (CoT) loops and agentic ReAct pipelines with tool execution.

---

## 📚 Overview

Prompt engineering is the craft of structuring input text to guide Large Language Models (LLMs) toward accurate, deterministic, and contextually grounded results. Rather than relying on simple text queries, complex application logic often requires orchestrating model reasoning steps, providing output format examples, or executing custom tool workflows.

```text
               Prompting Strategies
                         │
      ┌──────────────────┼──────────────────┐
      ▼                  ▼                  ▼
 Zero-Shot           Few-Shot           Chain-of-Thought (CoT)
(Direct Prompt)    (In-Context Examples) (Step-by-Step Pipeline & Tools)

```

In this module, you will learn how to implement zero-shot and few-shot prompting, manual multi-turn Chain-of-Thought (CoT) execution pipelines, and an agentic tool-use loop with CLI command execution and live weather lookup capabilities.

---

## 🎯 Learning Objectives

After completing this module, you will be able to:

* Distinguish between Zero-Shot, Few-Shot, and Chain-of-Thought (CoT) prompting techniques
* Steer model output formats deterministically using in-context few-shot examples
* Enforce structured multi-turn reasoning pipelines (`INITAL` $\rightarrow$ `THINK` $\rightarrow$ `ANALYSE` $\rightarrow$ `OUTPUT`) using JSON system schemas
* Implement custom tool-augmented agent loops capable of calling dynamic external functions (e.g., CLI command execution, live weather APIs)

---

## 📁 Project Structure

```text
04-prompting/
├── 01-zero-shot.js
├── 02-few-shot.js
├── 03-chain-of-thought.js
├── 04-chain-of-thought.js
└── prompt.md

```

---

## 📦 Prerequisites

* Node.js 18+
* Active OpenAI API Key set in `.env` (`OPENAI_API_KEY`)
* System access to terminal shell execution (for tool execution examples)

---

## 📥 Install Dependencies

From the project root:

```bash
npm install openai axios dotenv

```

---

## ▶️ Running the Examples

### Zero-Shot Prompting

```bash
node 04-prompting/01-zero-shot.js

```

### Few-Shot Prompting

```bash
node 04-prompting/02-few-shot.js

```

### Chain-of-Thought (CoT) Reasoning

```bash
node 04-prompting/03-chain-of-thought.js

```

### Chain-of-Thought with Tool Execution

```bash
node 04-prompting/04-chain-of-thought.js

```

---

# Key Prompting Paradigms

## 1. Zero-Shot Prompting

* **Definition**: Providing direct instructions or questions to the model without pre-loading any prior examples or demonstration pairs.
* **Best Used For**: Straightforward text generation, simple summaries, standard QA, and tasks where the model's pre-trained knowledge is sufficient.

## 2. Few-Shot Prompting

* **Definition**: Providing direct instructions accompanied by one or more explicit input-output demonstration pairs within the prompt context.
* **Best Used For**: Influencing output formatting, style matching, domain-specific classification, or forcing strict syntax constraints without changing model weights.

## 3. Chain-of-Thought (CoT) Prompting

* **Definition**: Instructing the model to break down complex problems into explicit intermediate reasoning steps prior to producing a final output.
* **Best Used For**: Multi-step arithmetic, symbolic logic, complex task planning, and agentic workflows that require external tool execution or decision validation.

---

# Example Walkthroughs

---

## Example 1 — Zero-Shot Prompting

**File**: `04-prompting/01-zero-shot.js`

### Overview

Demonstrates a direct instruction query sending a single user message to `gpt-4o-mini` without auxiliary guidance or input examples.

### Code Implementation

```javascript
import { OpenAI } from 'openai';
import 'dotenv/config';

const client = new OpenAI();

async function main() {
  const result = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: 'tell me a story about little red ridding hood',
      },
    ],
  });
  console.log(`Ans from OpenAI API:`, result.choices[0].message.content);
}

main();

```

---

## Example 2 — Few-Shot Prompting

**File**: `04-prompting/02-few-shot.js`

### Overview

Demonstrates how in-context demonstration pairs guide the model to output answers adhering to a specific format (`Expected Output: <Value> (<Word Count>)`) without adding extraneous chat conversational text.

### Code Implementation

```javascript
import { OpenAI } from 'openai';
import 'dotenv/config';

const client = new OpenAI();

async function main() {
  const result = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `
        what is 2 + 5 equals?
        Do not add anything else in ans, take the samples from the examples.
        Examples:
        - what is 5 + 4?
          Expected Output: 9 (Nine)
        - What is 10 + 10?
          Expected Output: 20 (Twenty)
        `,
      },
    ],
  });
  console.log(`Ans from OpenAI API:`, result.choices[0].message.content);
}

main();

```

### Expected Output

```text
Ans from OpenAI API: 7 (Seven)

```

---

## Example 3 — Chain-of-Thought (CoT) Reasoning Pipeline

**File**: `04-prompting/03-chain-of-thought.js`

### Overview

Implements a manual step-by-step reasoning pipeline. System instructions enforce JSON output structured around pipeline stages: `INITAL` $\rightarrow$ `THINK` $\rightarrow$ `ANALYSE` $\rightarrow$ `OUTPUT`. The program runs a loop where each turn feeds the assistant's previous thought back into the conversation thread until a step named `OUTPUT` is returned.

### Code Implementation

```javascript
import { OpenAI } from 'openai';
import 'dotenv/config';

const client = new OpenAI();

const SYSTEM_PROMPT = `
  You are an expert AI engineer. You have to analyse the user's input carefully and then you need to
  breakdown the problem into multiple sub problems before comming on to the final result. Always breakdown
  the users intention and how to solve that problem and then step by step solve it.

  We are going to follow a pipeline of "INITAL", "THINK", "ANALYSE" and "OUTPUT" pipline.

  The Pipeline:
  - "INITAL" When user gives an input, we will have an inital thought process on what this user is trying to do.
  - "THINK" this is where we are going to think about how to solve this and then start to breakdown the problem
  - "ANALYSE" this is where we will analyse the solution and also verify if the output is correct
  - "THINK" we can go back to think mode where we now see if any sub problem remanins and think
  - "ANALYSE" again analyse the problem and get onto a solution
  - "OUTPUT" this is where we can end and give the final output to the user.

  Rules:
  - Always output one step at a time and wait for other step before proceeding.
  - Always maintain the sequence of pipeline as given in example
  - Always follow JSON output format strictly.

  Example:
  - "USER": What is 2 + 2 - 5 * 10 / 3?
  OUTPUT:
  - "INITAL": "The user wants me to solve a maths equation"
  - "THINK": "I will use the BODMAS formula and based on that I should firt multiple 5 * 10 which is 50"
  - "ANALYSE": "Yes, the bodmas is actaully right and now equation is 2 + 2 - 50 / 3"
  - "THINK": "Now as per rule I should perform divide which is dividing 50 / 3 which is 16.666667"
  - "ANALYSE": "Now the new equations remains 2 + 2 - 16.666667"
  - "THINK": "Now its simple we can just do 2 + 2 = 4 and new equation remains 4 - 16.6666667"
  - "ANALYSE": "Great, now lets just do the final step as simple subtraction"
  - "THINK": "After the final subtraction the ans remations -12.666667"
  - "OUTPUT": "The final output is "-12.666667"

  Output Format:
  { "step": "INITAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>" }
`;

const MESSAGES_DB = [{ role: 'system', content: SYSTEM_PROMPT }];

async function main(prompt = '') {
  MESSAGES_DB.push({ role: 'user', content: prompt });

  while (true) {
    const result = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: MESSAGES_DB,
      response_format: { type: 'json_object' },
    });

    const rawResult = result.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({ role: 'assistant', content: rawResult });

    console.log(`🤖 (${parsedResult.step}): ${parsedResult.text}`);

    if (parsedResult.step.toLowerCase() === 'output') break;
  }
}

main('What is weather of Patiala?');

```

---

## Example 4 — Chain-of-Thought with Custom Tool Execution

**File**: `04-prompting/04-chain-of-thought.js`

### Overview

Combines Chain-of-Thought (CoT) reasoning with custom tool execution via a step loop. The model can request tools like `getWeatherData` or `executeCommandOnCli`. When a `TOOL_REQUEST` step is parsed, Node.js executes the requested local command or API call, appends the output to the history database (`MESSAGES_DB`), and allows the model to resume its reasoning pipeline.

### Workflow Architecture

```text
           User Prompt ("Build a TODO app...")
                            │
                            ▼
                GPT-4o Reasoning Loop
                            │
    ┌───────────────────────┴───────────────────────┐
    ▼                                               ▼
{ step: "THINK" }                       { step: "TOOL_REQUEST" }
    │                                               │
    ▼                                               ▼
Log to Console                           Execute JS Function
                                         (e.g., executeCommandOnCli)
                                                    │
                                                    ▼
                                         Append Output to Thread
                                                    │
                                                    ▼
                                           Resume Reasoning

```

### Code Implementation

```javascript
import { OpenAI } from 'openai';
import axios from 'axios';
import { exec } from 'child_process';
import 'dotenv/config';

const client = new OpenAI();

async function getWeatherData(cityName) {
  const url = `https://wttr.in/${cityName.toLowerCase()}?format=%C+%t`;
  const response = await axios.get(url, { responseType: 'text' });
  return JSON.stringify({ cityName, weatherInfo: response.data });
}

async function executeCommandOnCli(cmd) {
  return new Promise((res) => {
    exec(cmd, (err, out) => {
      if (err) return res(`There was an Error ${err}`);
      else return res(out);
    });
  });
}

const SYSTEM_PROMPT = `
  You are an expert AI engineer. Only and only answer questions related to coding and engineering.
  
  Persona: You are a senior software developer.
  Persona Traits:
  - You always sound technical and use jargon.
  - You never answer back on personal things and you don't have a personal life.
  - All you know is how and what code is.

  You have to analyse the user's input carefully and then breakdown the problem into multiple sub problems.

  We follow a pipeline of "INITAL", "THINK", "TOOL_REQUEST", "ANALYSE" and "OUTPUT".

  Available Tools:
  - "getWeatherData": getWeatherData(cityName: string): Returns the realtime weather information of city
  - "executeCommandOnCli": executeCommandOnCli(command: string): Executes the command on user's device and returns output

  Output Format:
  { "step": "INITAL" | "THINK" | "TOOL_REQUEST" | "ANALYSE" | "OUTPUT", "text": "<The Actual Text>", "functionName": "<NAME OF FUNCTION>", "input": "<PARAMS>" }
`;

const MESSAGES_DB = [{ role: 'system', content: SYSTEM_PROMPT }];

async function main(prompt = '') {
  MESSAGES_DB.push({ role: 'user', content: prompt });

  while (true) {
    const result = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: MESSAGES_DB,
      response_format: { type: 'json_object' },
    });

    const rawResult = result.choices[0].message.content;
    const parsedResult = JSON.parse(rawResult);

    MESSAGES_DB.push({ role: 'assistant', content: rawResult });

    console.log(`🤖 (${parsedResult.step}): ${parsedResult.text || ''}`);

    if (parsedResult.step.toLowerCase() === 'output') break;

    if (parsedResult.step.toUpperCase() === 'TOOL_REQUEST') {
      const { functionName, input } = parsedResult;

      let toolResult = '';
      if (functionName === 'executeCommandOnCli') {
        toolResult = await executeCommandOnCli(input);
      } else if (functionName === 'getWeatherData') {
        toolResult = await getWeatherData(input);
      }

      console.log(`🛠️ (${functionName}): ${input} ->`, toolResult);

      MESSAGES_DB.push({
        role: 'developer',
        content: JSON.stringify({ step: 'TOOL_OUTPUT', output: toolResult }),
      });
    }
  }
}

main(
  'Build a funny functional design working TODO application and run on browser and store all files on todo folder'
);

```

---

## 🧠 Key Concepts Covered

### 1. In-Context Learning

Few-shot prompting provides high-precision control over output structure without necessitating fine-tuning or model retraining.

### 2. Manual ReAct & Step Loops

By restricting outputs to specific JSON steps (`INITAL`, `THINK`, `TOOL_REQUEST`, `ANALYSE`, `OUTPUT`), applications can inspect, log, and step through model reasoning before authorizing side effects (like CLI commands).

### 3. Tool Augmentation

Models determine *which* tool to invoke and *what arguments* to pass, while the client application handles physical execution and returns results back into context.

---

# 📝 Notes & Best Practices

* **Enforce JSON Formatting**: When building structured CoT loops, pass `{ response_format: { type: "json_object" } }` to prevent standard free-form markdown responses from breaking `JSON.parse()`.
* **Command Shell Guardrails**: Giving LLMs access to shell environments via functions like `executeCommandOnCli` carries security risks. Sanitize command strings and restrict execution scope in production setups.

