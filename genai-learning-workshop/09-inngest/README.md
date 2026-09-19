# Inngest + Express

A simple **Inngest + Express.js** setup using JavaScript. This project demonstrates how to create an Inngest function, trigger it with an event, pass `name` and `age` through the event, and monitor the execution using the local Inngest Dev Server.

## Tech Stack

* Node.js
* Express.js
* Inngest
* JavaScript

## Setup

Create the project:

```bash
mkdir inngest-demo
cd inngest-demo
npm init -y
```

Install dependencies:

```bash
npm install express inngest
```

Create the project files:

```bash
mkdir inngest
touch server.js
touch inngest/index.js
```

Enable ES Modules:

```bash
npm pkg set type=module
```

Add the start script:

```bash
npm pkg set scripts.start="node server.js"
```

## Project Structure

```text
inngest-demo/
├── inngest/
│   └── index.js
├── server.js
├── package.json
└── package-lock.json
```

## Run the Application

Start the Express server in Inngest development mode:

```bash
INNGEST_DEV=1 node --watch ./server.js
```

The Express server runs at:

```text
http://localhost:3000
```

In another Git Bash terminal, start the Inngest Dev Server:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

The Inngest Dev Server runs at:

```text
http://localhost:8288
```

Open the dashboard:

```text
http://localhost:8288
```

## Inngest Endpoint

Inngest communicates with the Express application through:

```text
http://localhost:3000/api/inngest
```

This endpoint allows the Inngest Dev Server to discover and execute the registered functions.

## Test the API

Open:

```text
http://localhost:3000/api/hello
```

The API returns:

```json
{
  "message": "Event sent!"
}
```

Calling this endpoint sends a `user/get` event to Inngest.

## Event Data

The event contains:

```text
name: Prince
age: 22
```

The `get-user` function receives this data through `event.data` and returns the same `name` and `age`.

## Example Flow

```text
GET /api/hello
      ↓
inngest.send()
      ↓
user/get Event
      ↓
get-user Function
      ↓
{name, age}
```

## Inngest Dashboard

After calling:

```text
http://localhost:3000/api/hello
```

open:

```text
http://localhost:8288
```

Go to **Runs** and open the `get-user` function execution.

You can inspect:

* Event
* Input
* Output
* Function
* Execution status

A successful execution will show:

```text
Completed
```

The function output will contain:

```json
{
  "name": "Prince",
  "age": 22
}
```

## `inngest.send()` vs Function Output

`inngest.send()` sends an event to Inngest. It does not directly return the output of the Inngest function.

The flow is:

```text
inngest.send()
      ↓
Event
      ↓
Inngest Function
      ↓
Function Output
```

The function output can be viewed in the Inngest Dev Server.

## Final Architecture

```text
┌──────────────────────────────┐
│          Express             │
│       localhost:3000         │
│                              │
│   GET /api/hello             │
│          │                   │
│          ▼                   │
│    inngest.send()            │
└──────────┬───────────────────┘
           │
           │ user/get
           ▼
┌──────────────────────────────┐
│      Inngest Dev Server      │
│       localhost:8288         │
│                              │
│       user/get event         │
│             │                │
│             ▼                │
│        get-user()            │
│             │                │
│             ▼                │
│    { name, age }             │
└──────────────────────────────┘
```

## Useful Commands

Start Express normally:

```bash
npm start
```

Start Express in Inngest development mode:

```bash
INNGEST_DEV=1 node --watch ./server.js
```

Start the Inngest Dev Server:

```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```

## Key Concepts

* **Event:** Triggers an Inngest function.
* **Function:** Contains the background task logic.
* **`event.data`:** Contains the data sent with the event.
* **`inngest.send()`:** Sends an event to Inngest.
* **Inngest Dev Server:** Provides a local dashboard for testing and monitoring functions.
* **Input:** Data received by the Inngest function.
* **Output:** Data returned by the Inngest function.
