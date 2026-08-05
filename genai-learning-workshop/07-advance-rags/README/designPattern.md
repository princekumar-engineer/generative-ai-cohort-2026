## 🎨 Design Patterns Used in Your Project

### 1. Producer-Consumer Pattern

* **Where it is used:** `index.js` (Producer) and `worker.js` (Consumer) via `queue.js` (BullMQ/Redis).
* **How it works:**
The HTTP server (`index.js`) doesn't do the heavy processing itself. Instead, it acts as a **Producer** that creates tasks and drops them into a queue. In the background, `worker.js` acts as a **Consumer** that picks up tasks from the queue and executes them.
* **Why it matters:**
If a user uploads a huge 50-page PDF, parsing and embedding it could take 30 seconds. Without this pattern, the HTTP request would freeze or time out. With this pattern, the server instantly accepts the request, returns a job ID, and processes the file safely in the background.

---

### 2. Microservice / Decoupled Architecture (Worker Pattern)

* **Where it is used:** Separating `index.js` (Web API) from `worker.js` (Background Workers).
* **How it works:**
The Web API and the Background Workers are completely decoupled. You can run `index.js` on one server to handle HTTP traffic and run `worker.js` on 5 different servers to handle heavy background processing.
* **Why it matters:**
If user traffic surges, you can scale your background workers up or down independently without touching your web server.

---

### 3. Asynchronous Polling Pattern

* **Where it is used:** `POST /query` and `GET /query/:id` in `index.js`.
* **How it works:**
Instead of holding the HTTP request open until OpenAI and Qdrant finish processing (which could take several seconds), `POST /query` returns `202 Accepted` with a `jobId` and a polling URL (`/query/:id`). The client periodically calls `GET /query/:id` until the job status changes from `"active"` to `"completed"`.
* **Why it matters:**
Prevents HTTP connection timeouts, handles slow network connections gracefully, and gives front-end interfaces an easy way to show progress loaders.

---

### 4. Modular / Layered Architecture

* **Where it is used:** Separating code into `config`, `indexer`, `retriever`, `openai`, and `qdrant`.
* **How it works:**
Each module has a single, well-defined responsibility:
* **Configuration Layer (`config.js`)**: Manages environment variables and constants.
* **Data/Client Layer (`qdrant.js`, `openai.js`)**: Wraps external API clients.
* **Business Logic Layer (`indexer.js`, `retriever.js`)**: Implements chunking, HyDE, and RRF algorithms.
* **Interface Layer (`index.js`)**: Exposes REST endpoints.


* **Why it matters:**
If you decide to swap Qdrant for another vector database (like Pinecone) or replace OpenAI with Anthropic Claude, you only need to update the respective client module without changing the rest of your app.

---

### 5. Singleton Pattern (Module Singleton)

* **Where it is used:** `qdrant.js` (`qdrant` client instance) and `openai.js` (`openai` client instance).
* **How it works:**
ES modules in Node.js evaluate imported files once and cache the result. When multiple files import `qdrant` or `openai`, they share the exact same client instance rather than creating new database connections or API client instances every time.
* **Why it matters:**
Saves system memory, prevents connection leaks, and reuses open TCP sockets for faster performance.

---

### 6. Strategy Pattern (Advanced Query Expansion)

* **Where it is used:** `retriever.js` inside `retrieveChunks()`.
* **How it works:**
To find the best context chunks in Qdrant, the system doesn't rely on just one search query. It executes **multiple retrieval strategies** simultaneously:
1. *Step-Back Strategy*: Broad background search.
2. *Sub-Query Strategy*: Focused sub-question search.
3. *HyDE Strategy*: Hypothetical document vector matching.
4. *Query Rewriting Strategy*: Corrected semantic intent search.


* **Why it matters:**
Different search strategies catch different relevant chunks. Combining them provides higher search accuracy (recall) than any single strategy could achieve alone.

---

### 7. Data Pipeline Pattern

* **Where it is used:** `indexer.js` (`indexPdf` function).
* **How it works:**
Data flows sequentially through a series of discrete transformation steps:

$$\text{PDF File} \longrightarrow \text{Raw Text} \longrightarrow \text{Text Chunks} \longrightarrow \text{Vector Embeddings} \longrightarrow \text{Qdrant Points}$$


* **Why it matters:**
Each step in the pipeline is isolated and testable. If chunking logic needs improvement, you can modify `chunkText()` without breaking the embedding or vector database steps.

---

### Summary Checklist of Patterns in Your Code

| Pattern | Location | Purpose |
| --- | --- | --- |
| **Producer-Consumer** | `index.js` $\rightarrow$ `queue.js` $\rightarrow$ `worker.js` | Offloads heavy tasks to background queues |
| **Decoupled Architecture** | API Server vs. Worker Process | Allows scaling workers independently |
| **Asynchronous Polling** | `POST /query` & `GET /query/:id` | Prevents HTTP timeouts for long operations |
| **Layered Architecture** | `src/` modules | Keeps code clean and maintainable |
| **Singleton** | `openai.js`, `qdrant.js` | Reuses single API/database client instances |
| **Strategy Pattern** | `retriever.js` | Combines HyDE, Step-Back, and Sub-Queries |
| **Pipeline Pattern** | `indexer.js` | Transforms raw PDFs into stored vector points |