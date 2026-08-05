> ⚠️ **WARNING: Educational & Demonstration Purpose Only**
> 
> This repository is designed exclusively for **educational and learning purposes** to demonstrate advanced RAG (Retrieval-Augmented Generation) concepts—such as HyDE, Step-Back Prompting, Sub-Query Decomposition, Reciprocal Rank Fusion (RRF), and background worker queues.
> 
> **Note:** This codebase is provided as-is for conceptual understanding and architecture reference. It is **not configured or intended for production deployment** and may require additional security, input validation, error handling, storage cleanup, and environment configuration before running.
---

# Advanced RAG Pipeline

An asynchronous, queue-backed Retrieval-Augmented Generation (RAG) pipeline built with **Node.js**, **Express**, **BullMQ**, **Qdrant**, and **OpenAI**.

This repository provides an enterprise-grade document ingestion and querying solution using background workers to decouple file processing, embedding generation, hybrid-style vector search using HyDE (Hypothetical Document Embeddings), Step-Back prompting, Sub-Query decomposition, Reciprocal Rank Fusion (RRF), and LLM response generation.

Unlike a traditional RAG implementation, this project incorporates several advanced retrieval techniques including:

- Query Rewriting
- Step-Back Prompting
- HyDE (Hypothetical Document Embeddings)
- Multi-Query Retrieval
- Reciprocal Rank Fusion (RRF)

---

## 🏗️ Architecture & Technical Workflow

```text
[ Client ] 
   │
   ├─► POST /index (PDF File)  ──► [ Express API ] ──► (Enqueues Job) ──► [ Redis Queue ]
   │                                                                            │
   │                                                                      [ BullMQ Worker ]
   │                                                                            │
   │                                  (Extract & Chunk Text) ◄──────────────────┤
   │                                             │
   │                                  (Generate Embeddings) ──► [ OpenAI API ]
   │                                             │
   │                                  (Store Vectors)      ──► [ Qdrant Vector DB ]
   │
   ├─► POST /query (Prompt)    ──► [ Express API ] ──► (Enqueues Job) ──► [ Redis Queue ]
   │                                                                            │
   │                                                                      [ BullMQ Worker ]
   │                                                                            │
   │               (Multi-Query Expansion: Step-Back, HyDE, Sub-Queries) ◄──────┤
   │                                             │
   │                                  (Vector Search)      ──► [ Qdrant Vector DB ]
   │                                             │
   │                                  (RRF Rank Fusion)
   │                                             │
   │                                  (Generate Answer)    ──► [ OpenAI API ]
   │
   └─► GET /query/:id (Poll)   ──► Returns final answer when state === "completed"

```

### Core Architecture Capabilities

1. **Asynchronous Ingestion**: Uploaded PDFs are stored locally in `/uploads` using `multer` with unique generated filenames and queued into the BullMQ `file-indexing` queue.
2. **Resilient Queueing & Concurrency**: Built with BullMQ backed by Redis (`maxRetriesPerRequest: null`). Supports concurrent processing (Indexing concurrency: 2, Query concurrency: 4) with exponential backoffs for handling failed execution attempts.
3. **Smart Text Chunking**: Extracts text using `pdf-parse` and divides it into configured sliding window chunks (`CHUNK_SIZE`, `CHUNK_OVERLAP`) while respecting word whitespace boundaries.
4. **Batched Embedding Ingestion**: Utilizes OpenAI's `text-embedding-3-small` (1536 dimensions) with batching (`batchSize = 100`) to respect API limits and optimize vector generation.
5. **Advanced Retrieval Pipeline**:
* **Query Rewriting & Fixing**: Corrects grammar and typos to make queries self-contained.
* **Step-Back Prompting**: Generates higher-level background questions for context.
* **Sub-Query Decomposition**: Breaks complex queries into 3 focused sub-questions.
* **HyDE (Hypothetical Document Embeddings)**: Generates a hypothetical reference answer to bridge the semantic distance between queries and source documents in vector space.
* **Reciprocal Rank Fusion (RRF)**: Merges and re-ranks multi-query search results into a unified top-retrieval context.


6. **Dynamic Vector Storage**: Auto-creates Qdrant collections on demand with Cosine distance metric and upserts vectors alongside text payloads, source metadata, and chunk indexes.
7. **Polled Querying Architecture**: Query tasks are enqueued into BullMQ (`query` queue). Clients receive a `jobId` to poll `GET /query/:id` until processing completes, preventing HTTP request timeout issues.

---

## 📁 Project Structure

```text
advance-rag-pipeline-main/
├── src/
│   ├── config.js         # Centralized system configurations and environment constants
│   ├── index.js          # Express server, route endpoints, and Multer file upload setup
│   ├── indexer.js        # PDF text parsing, sliding window chunking, and Qdrant indexing
│   ├── openai.js         # Shared OpenAI client, single, and batched embedding handlers
│   ├── qdrant.js         # Qdrant REST client and collection creation/verification logic
│   ├── queue.js          # BullMQ queue producers for indexing and query task orchestration
│   ├── retriever.js      # Advanced query expansion (HyDE, Step-Back, Sub-Queries), RRF, and Qdrant search
│   └── worker.js         # BullMQ consumer processes executing indexing (concurrency 2) and query (concurrency 4) tasks
├── uploads/              # Local disk storage directory for uploaded PDF documents
├── .env.example          # Template file for environment variable settings
├── .gitignore            # Git exclusion rules
├── docker-compose.yml    # Container specs for local Redis and Qdrant services
├── package.json          # Node project dependencies and run scripts
└── README.md             # Project documentation

```

---

## 🚀 Prerequisites

Ensure the following tools are installed on your environment:

* **Node.js**: `v18.x` or higher (Supports native ESM imports)
* **npm**: `v9.x` or higher
* **Docker & Docker Compose**: For containerized Redis and Qdrant instances
* **OpenAI API Key**: Access to OpenAI API embedding (`text-embedding-3-small`) and chat (`gpt-4o-mini`) models

---

## ⚙️ Installation & Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/advance-rag-pipeline.git
cd advance-rag-pipeline-main
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root folder using `.env.example`:

```bash
cp .env.example .env
```

Configure the environment settings:

```env
# Server Port Configuration
PORT=8000

# Redis Service (BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Qdrant Database Settings
QDRANT_URL=http://127.0.0.1:6333
QDRANT_COLLECTION=documents

# OpenAI Model Credentials & Settings
OPENAI_API_KEY=your_openai_api_key_here
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
CHAT_MODEL=gpt-4o-mini

# Text Chunking Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Retrieval & Fusion Parameters
RETRIEVAL_TOP_K=4
RRF_K=60
RETRIEVAL_FINAL_K=5
```

---

## 🐳 Infrastructure Startup

Launch Redis and Qdrant services locally using Docker Compose:

```bash
docker-compose up -d
```

This command deploys:

* **Redis**: Port `6379` (Job queuing and job status lifecycle management)
* **Qdrant**: Port `6333` (REST API for Vector Storage & Vector Similarity Search)

---

## 🏃 Running the Application

### Option A: Running in Development Mode

Start the HTTP Express server:

```bash
npm run dev
```

In a separate terminal window, start the BullMQ task worker process:

```bash
npm run worker
```

### Option B: Running in Production Mode

Start the HTTP Express API server:

```bash
npm run start
```

Start the task consumer worker:

```bash
npm run worker
```

---

## 📡 API Endpoints & Usage

### 1. Health Status

Check if the API server is up and responsive.

* **Endpoint**: `GET /health`
* **Response**: `200 OK`

```json
{
  "status": "ok"
}
```

---

### 2. Index PDF File

Upload a PDF file (up to 25 MB) to be saved, chunked, embedded, and indexed.

* **Endpoint**: `POST /index`
* **Header**: `Content-Type: multipart/form-data`
* **Body Form Field**: `file` (PDF document)

#### Curl Example:

```bash
curl -X POST http://localhost:8000/index \
  -F "file=@/path/to/sample.pdf"
```

#### Response (`202 Accepted`):

```json
{
  "message": "File uploaded and queued for indexing",
  "jobId": "1",
  "file": {
    "originalName": "sample.pdf",
    "storedAs": "1710000000000-abcd-1234.pdf",
    "size": 1048576
  }
}
```

---

### 3. Submit RAG Query

Enqueue a query job to perform vector retrieval and response generation.

* **Endpoint**: `POST /query`
* **Header**: `Content-Type: application/json`
* **Body Payload**:

```json
{
  "query": "What are the key technical concepts explained in the document?"
}
```

#### Curl Example:

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the key technical concepts explained in the document?"}'
```

#### Response (`202 Accepted`):

```json
{
  "message": "Query queued",
  "jobId": "10",
  "poll": "/query/10"
}
```

---

### 4. Poll Query Status & Results

Retrieve the execution status or final answer using the `jobId` returned from `/query`.

* **Endpoint**: `GET /query/:id`

#### Curl Example:

```bash
curl -X GET http://localhost:8000/query/10
```

#### Response (Job Active/Processing):

```json
{
  "jobId": "10",
  "status": "active"
}
```

#### Response (Job Completed):

```json
{
  "jobId": "10",
  "status": "completed",
  "result": {
    "query": "What are the key technical concepts explained in the document?",
    "answer": "The document primarily details...",
    "sources": [
      {
        "text": "Excerpt from the document chunk...",
        "source": "sample.pdf",
        "chunkIndex": 3,
        "score": 0.892
      }
    ]
  }
}
```

---

## 🛠️ Advanced Retrieval Features & Formulas

### Reciprocal Rank Fusion (RRF)

The retrieval engine uses Reciprocal Rank Fusion (RRF) to combine search results across all generated query variants (original query, rewritten query, step-back question, HyDE document, sub-queries) into a single ranked list using the standard RRF equation:

$$\text{RRF\_Score}(d \in D) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$

Where:

* $M$ is the set of generated query variations and hypothetical documents.
* $r_m(d)$ is the 1-based rank position of document chunk $d$ in the top-$K$ search results of variant $m$.
* $k$ is a smoothing constant configured via `RRF_K` (default: `60`).

---
<div style="background-color: #2d1800; border-left: 5px solid #f0883e; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
  <strong style="color: #f0883e;">⚠️ WARNING: Educational & Demonstration Purpose Only</strong>
  <br/><br/>
  This repository is designed exclusively for <b>educational and learning purposes</b> to demonstrate advanced RAG (Retrieval-Augmented Generation) concepts—such as HyDE, Step-Back Prompting, Sub-Query Decomposition, Reciprocal Rank Fusion (RRF), and background worker queues.
  <br/><br/>
  <b>Note:</b> This codebase is provided as-is for conceptual understanding and architecture reference. It is <b>not configured or intended for production deployment</b> and may require additional security, input validation, error handling, storage cleanup, and environment configuration before running.
</div>