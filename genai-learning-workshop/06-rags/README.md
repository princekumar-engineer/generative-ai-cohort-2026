# 06 - RAG Pipeline with Qdrant, LangChain & OpenAI

A Retrieval-Augmented Generation (RAG) system built with Node.js, OpenAI (`text-embedding-3-small` & `gpt-4o`), LangChain, and Qdrant vector database for indexing and querying technical PDF documents (`dsa.pdf`, `nodejs.pdf`, `software.pdf`).

---

## 🔄 System Architecture & Workflow

The system operates across two core pipelines: **Indexing** (Ingestion) and **Querying** (Retrieval & Generation).

```text
[ Document Ingestion Workflow ]
┌──────────────┐     ┌───────────────┐     ┌────────────────────────┐     ┌───────────────────┐
│ Local PDFs   │ ──> │ PDFLoader     │ ──> │ OpenAI Embedding       │ ──> │ Qdrant Vector Store│
│ (dsa.pdf...) │     │ (Page Chunks) │     │ (text-embedding-3-small)│    │ (chaicode-docs)   │
└──────────────┘     └───────────────┘     └────────────────────────┘     └───────────────────┘

[ Query & Generation Workflow ]
┌──────────────┐     ┌────────────────────────┐     ┌───────────────────┐
│ User Query   │ ──> │ OpenAI Embedding       │ ──> │ Qdrant Vector Store│
│              │     │ (text-embedding-3-small)│     │ (Top K = 5 Search)│
└──────────────┘     └────────────────────────┘     └─────────┬─────────┘
                                                              │
                                                              ▼
┌──────────────┐     ┌────────────────────────┐     ┌───────────────────┐
│ Final Output │ <── │ OpenAI GPT-4o          │ <── │ Structured System │
│ (with pages) │     │ (Strict Context Chat)  │     │ Prompt Injection  │
└──────────────┘     └────────────────────────┘     └───────────────────┘

```

### Detailed Pipeline Flow

1. **Ingestion & Indexing Phase (`indexing.js`)**:
* `PDFLoader` reads PDF documents and parses content into page-level chunks.
* Text chunks are sent to OpenAI (`text-embedding-3-small`) to produce 1536-dimensional vector representations.
* Embeddings along with payload metadata (`source`, `pageNumber`, `pageContent`) are written to the `chaicode-docs` collection in Qdrant.


2. **Retrieval & Generation Phase (`query.js`)**:
* The user inputs a text question.
* The query is embedded and searched against Qdrant to fetch the top 5 most relevant document chunks.
* Retrieved chunks and metadata are formatted into a structured system prompt.
* OpenAI `gpt-4o` evaluates the context and generates a grounded response containing page citations and book references.



---

## 📁 Project Structure

```text
06-rags/
├── docker-compose.yml   # Qdrant Vector DB container setup
├── .env                 # Environment secrets (API keys)
├── dsa.pdf              # Document: Data Structures & Algorithms
├── nodejs.pdf           # Document: Node.js Reference
├── software.pdf         # Document: Software Engineering
├── indexing.js          # Ingests PDF, computes embeddings, and stores vectors in Qdrant
└── query.js             # Vector search retriever & strict context LLM query

```

---

## 🛠️ Prerequisites & Setup

### 1. Configure Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here

```

### 2. Install Dependencies

Install all required packages:

```bash
npm install @langchain/community @langchain/openai @langchain/qdrant openai dotenv

```

### 3. Start Infrastructure (Qdrant Vector DB)

Ensure your `docker-compose.yml` contains the Qdrant service configuration:

```yaml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    container_name: qdrant_rag
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage

volumes:
  qdrant_storage:

```

Start the service via Docker Compose:

```bash
docker compose up -d

```

### 4. Initialize Qdrant Collection

Because `indexing.js` calls `QdrantVectorStore.fromExistingCollection`, create the `chaicode-docs` collection configured for `text-embedding-3-small` (vector size **1536**, **Cosine** distance) before running the indexing script:

```bash
curl -X PUT 'http://localhost:6333/collections/chaicode-docs' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'

```

---

## 🚀 Execution Workflow

### Step 1: Document Indexing (`indexing.js`)

Parses PDF files page-by-page, generates 1536-dimensional embeddings, and pushes vectors into Qdrant.

To run document indexing:

```bash
node indexing.js

```

> **Note:** By default, `indexing.js` targets `./dsa.pdf`. Change the path in `generateVectorEmbeddingsForFile("./filename.pdf")` inside `indexing.js` to process `nodejs.pdf` or `software.pdf`.

### Step 2: Context-Aware Querying (`query.js`)

Performs a similarity search against Qdrant (`k = 5`), constructs a system prompt containing retrieved context, and prompts `gpt-4o` to generate an answer.

To execute a search query:

```bash
node query.js

```

---

## 📝 Technical Implementation Details

* **Embedding Model**: OpenAI `text-embedding-3-small` (1536 dimensions).
* **LLM Engine**: OpenAI `gpt-4o`.
* **Vector Store**: Qdrant running locally at `http://localhost:6333` (Collection: `chaicode-docs`).
* **Document Parsing**: `@langchain/community/document_loaders/fs/pdf` (`PDFLoader`).
* **Metadata Structure**: Source path (`e.metadata.source`) and page number (`e.metadata.loc.pageNumber`) are passed into the prompt as structured JSON:
```json
{
  "bookName": "e.metadata.source",
  "pageContent": "e.pageContent",
  "pageNumber": "e.metadata.loc.pageNumber"
}

```


* **Guardrails**: The system prompt enforces zero hallucination (*"Do not answer anything beyond what is provided"*), guaranteeing that answers reference exact sources and page numbers.