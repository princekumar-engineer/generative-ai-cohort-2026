## The Big Picture (What is RAG?)

Normally, an AI model like ChatGPT only knows what it was trained on in the past. It doesn't know about your personal PDF files or private company documents.

**RAG** solves this problem in 3 simple steps:

1. **Index**: You give the system a PDF. It reads the text, chops it into small chunks, and saves those chunks in a special database (**Qdrant**).
2. **Retrieve**: When you ask a question, the system searches the database for the chunks that best match your question.
3. **Generate**: It sends those matching chunks to OpenAI along with your question and says: *"Answer the user's question using ONLY this context."*

---

## How Your Code Works File-by-File

Here is a simple breakdown of what each file in your `src/` folder does:

### 1. `config.js` — The Settings Master

Think of this as the control panel for your app.

* It reads variables from a `.env` file (like your `OPENAI_API_KEY`).
* It sets default numbers, such as:
* What port the server runs on (`8000`).
* How big text chunks should be (`1000` characters).
* Which OpenAI models to use (`gpt-4o-mini` and `text-embedding-3-small`).



---

### 2. `index.js` — The Front Door (Express Server)

This is the web API that listens for incoming HTTP requests from users or frontend apps.

* **`POST /index`**: Accepts a PDF upload (up to 25 MB). Instead of making the user wait while it processes the file, it saves the file to disk and drops a "task" into a queue (BullMQ), then immediately gives the user a `jobId`.
* **`POST /query`**: Accepts a user question. It puts the question task into a queue and gives back a `jobId`.
* **`GET /query/:id`**: Lets the user check ("poll") if their query task is finished yet.

---

### 3. `queue.js` — The Task Creator (BullMQ)

Processing large PDFs or doing multiple AI calls can take several seconds. If a web server does that directly inside an HTTP request, it can crash or time out.

* `queue.js` uses **Redis** to create two task lists (queues):
1. `file-indexing` queue for PDFs.
2. `query` queue for user questions.


* It sends tasks to Redis with instructions like: *"If this task fails, retry it up to 3 times."*

---

### 4. `worker.js` — The Background Worker

While `index.js` receives request forms, `worker.js` is the worker sitting in the back office actually doing the heavy lifting.

* It runs continuously in the background, watching the Redis queues.
* When a new PDF arrives in the `file-indexing` queue, it calls functions in `indexer.js`.
* When a new question arrives in the `query` queue, it calls functions in `retriever.js`.
* It can handle multiple tasks at the same time (**concurrency**).

---

### 5. `indexer.js` — The PDF Converter

When a PDF task is picked up by a worker, this file handles it:

1. **Reads PDF**: Uses `pdf-parse` to convert raw PDF bytes into plain readable text.
2. **Chunking (`chunkText`)**: Cuts long text into smaller overlapping pieces (~1000 characters each with 200 characters overlap). Overlapping ensures that sentences at the edge of a chunk don't lose their meaning.
3. **Embeddings**: Sends text chunks to OpenAI to turn them into math vectors (numbers that capture meaning).
4. **Storage**: Saves those vectors into the Qdrant database alongside the text content.

---

### 6. `openai.js` — The OpenAI Bridge

A simple helper module that talks to OpenAI's API.

* Converts single or multiple pieces of text into **Embeddings** (numerical representations of text).
* Automatically processes text in batches of 100 to avoid overloading OpenAI's API.

---

### 7. `qdrant.js` — The Vector Database Manager

Standard databases search by exact keywords (e.g., searching for "dog" won't find "puppy"). A **Vector Database** like Qdrant searches by *semantic meaning* (it knows "dog" and "puppy" mean similar things).

* `qdrant.js` connects to Qdrant.
* `ensureCollection()` makes sure the database collection exists and is configured for 1536-dimensional vectors (matching OpenAI's embedding size).

---

### 8. `retriever.js` — The AI Brain & Super Search Engine

This is the most advanced part of your app. Instead of just doing a simple search, it uses four smart techniques before asking OpenAI for an answer:

1. **Query Rewriting**: Fixes typos and clarifies what the user is asking.
2. **Step-Back Prompting**: Asks a broader, higher-level background question to get extra context.
3. **Sub-Query Decomposition**: Breaks a complex question into 3 simpler sub-questions.
4. **HyDE (Hypothetical Document Embeddings)**: Asks OpenAI to write a fake 3-sentence "ideal" answer. Searching vector space using an ideal answer often hits the real source document chunks much better than searching with just a raw question.
5. **Reciprocal Rank Fusion (RRF)**: Executes vector searches for all these generated questions, then combines and mathematically re-ranks the top results to pick the absolute best context chunks.
6. **`answerQuery()`**: Feeds the final top chunks and the original user query into OpenAI (`gpt-4o-mini`) to generate a grounded, factual answer.

---

## Visual Summary of the Flow

```text
[ User Uploads PDF ] ──► Express API ──► BullMQ Queue (Redis)
                                              │
                                              ▼
                                    Worker Processes PDF:
                             (Extract -> Chunk -> Embed -> Save to Qdrant)

-------------------------------------------------------------------------

[ User Asks Question ] ──► Express API ──► BullMQ Queue (Redis)
                                                │
                                                ▼
                                      Worker Runs Retriever:
                      1. Rewrites Query + Creates HyDE & Sub-Queries
                      2. Searches Qdrant for matching chunks
                      3. RRF Re-ranks the best chunks
                      4. GPT-4o-mini answers using those chunks
                                                │
                                                ▼
[ User Polls GET /query/:id ] ◄────── Returns Answer + Source Chunks

```