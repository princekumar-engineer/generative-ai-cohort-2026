# Design Patterns in Agent SDK Proof of Concept

This document explains the main software design patterns used in the **Agent SDK Proof of Concept** and why they are useful.

---

# 1. Builder Pattern

## Purpose

The **Builder Pattern** makes it easy to create an `Agent` step by step instead of passing everything into one large constructor.

## How it works

The `AgentBuilder` stores configuration such as instructions and tools. Each method returns `this`, allowing method chaining. Calling `.build()` creates the final `Agent`.

```
┌──────────────┐      .setInstructions(...)      ┌──────────────┐
│ AgentBuilder │ ─────────────────────────────►  │ AgentBuilder │
└──────────────┘                                 └──────────────┘
       │                                                │
       │ .tool(...)                                     │ .build()
       ▼                                                ▼
┌──────────────┐                                 ┌──────────────┐
│ AgentBuilder │ ─────────────────────────────►  │    Agent     │
└──────────────┘                                 └──────────────┘
```

### Example

```typescript
const agent = Agent.builder()
    .setInstructions("You are a coding assistant")
    .tool(cliAccessTool)
    .build();
```

### Benefits

* Easy to configure an agent
* Supports readable method chaining
* Keeps object creation separate from the `Agent` class

---

# 2. Observer (Interceptor) Pattern

## Purpose

The **Observer Pattern** lets other parts of the application listen for events without changing the agent's main logic.

## How it works

The `Agent` allows interceptors to be registered using `attachInterceptor()`. Whenever a new message is generated, the agent notifies every registered interceptor.

```
       ┌──────────────┐
       │    Agent     │
       └──────┬───────┘
              │ notifyInterceptors(message)
     ┌────────┼────────┐
     ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐
│ Logger ││ Debug  ││ Monitor│
└────────┘└────────┘└────────┘
```

### Benefits

* Keeps logging separate from business logic
* Makes debugging easier
* Allows multiple listeners without modifying the agent

---

# 3. Command Pattern (Tool Abstraction)

## Purpose

The **Command Pattern** treats every tool as an object with a common interface. This allows the agent to execute different tools in the same way.

## How it works

Every tool implements the `ITool` interface. The agent stores these tools and executes the correct one when requested by the LLM.

```
                  ┌─────────────────┐
                  │     ITool       │
                  ├─────────────────┤
                  │ executor(input) │
                  └────────┬────────┘
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
┌────────────────────┐          ┌────────────────────┐
│ cliAccessTool      │          │ weatherTool        │
├────────────────────┤          ├────────────────────┤
│ exec(command)      │          │ axios(request)     │
└────────────────────┘          └────────────────────┘
```

### Benefits

* All tools follow the same interface
* Easy to add new tools
* The agent does not need to know how each tool works internally

---

# 4. Finite State Machine (FSM) / Pipeline Pattern

## Purpose

The **FSM (Pipeline) Pattern** guides the agent through a fixed sequence of reasoning steps instead of letting it generate responses randomly.

## Pipeline

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────┐
│ INITIAL  │ ──► │  THINK   │ ──► │ TOOL_REQUEST │ ──► │ ANALYSE  │ ──► │  OUTPUT  │
└──────────┘     └──────────┘     └──────────────┘     └──────────┘     └──────────┘
                      ▲                                     │
                      └─────────────────────────────────────┘
```

### Steps

1. **INITIAL** – Understand the user's request.
2. **THINK** – Break the problem into smaller tasks.
3. **TOOL_REQUEST** – Call a tool if needed.
4. **ANALYSE** – Review the tool's output and decide what to do next.
5. **OUTPUT** – Generate the final response.

### Benefits

* Makes reasoning more predictable
* Encourages structured problem solving
* Prevents the agent from skipping important steps

---

# 5. Strategy Pattern

## Purpose

The **Strategy Pattern** allows the same `Agent` runtime to behave differently by changing its instructions and available tools.

## Example

```typescript
// Coding Agent
const codingAgent = Agent.builder()
    .setInstructions("You are an expert coding agent")
    .tool(cliAccessTool)
    .build();

// Weather Agent
const weatherAgent = Agent.builder()
    .setInstructions("You are an expert weather agent")
    .tool(weatherTool)
    .build();
```

The execution logic stays the same, but each agent behaves differently based on its configuration.

### Benefits

* Reuses the same runtime
* Easy to create specialized agents
* No changes to the core `Agent` implementation

---

# Summary

| Pattern            | Where it's used       | Why it's useful                                          |
| ------------------ | --------------------- | -------------------------------------------------------- |
| **Builder**        | `AgentBuilder`        | Makes agent creation simple and readable                 |
| **Observer**       | `attachInterceptor()` | Lets external modules monitor events                     |
| **Command**        | `ITool`               | Provides a common way to execute different tools         |
| **FSM / Pipeline** | `HARNESS_PROMPT`      | Ensures structured, step-by-step reasoning               |
| **Strategy**       | Agent configuration   | Creates different agent behaviors using the same runtime |
