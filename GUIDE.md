# Production RAG Framework — Complete Build Guide

> **Free forever. $0 total cost. FAANG-tier portfolio project.**
>
> This document is the canonical specification for building a production-grade RAG (Retrieval Augmented Generation) framework using only free tools. It is structured for Claude Code to read, parse, and execute step by step.

---

## How to Use This Guide With Claude Code

This guide is designed to be opened in Claude Code (in your terminal, inside the project directory). To work with it efficiently, you can say things like:

- "Read GUIDE.md and start Phase 1"
- "Continue from Phase 2, Step 5"
- "Implement the code in Section 5.8 (Generator class)"
- "Run the tests for Phase 1 and tell me what failed"
- "Show me my progress against the roadmap in Section 6"

Claude Code will read this file, understand the structure, and execute the relevant steps.

---

## Project Metadata

```yaml
project_name: rag-framework
description: A production-grade Retrieval Augmented Generation framework with hybrid retrieval, citation tracking, and hallucination detection. Built entirely on free tier services.
language: Python 3.10+
license: MIT
total_cost: $0/month forever
total_phases: 6
estimated_timeline: 6-8 weeks
target_roles: SDE, Software Engineer, AI Engineer, ML Engineer at FAANG-tier companies
```

---

## Table of Contents

1. [Why Free — and Why It Doesn't Hurt Your Project](#1-why-free)
2. [Understanding RAG — The Foundation](#2-understanding-rag)
3. [The Complete $0 Stack](#3-the-complete-0-stack)
4. [Phase 1 — Document Ingestion and Chunking](#4-phase-1--document-ingestion-and-chunking)
5. [Phase 2 — Free Embeddings and Vector Storage](#5-phase-2--free-embeddings-and-vector-storage)
6. [Complete Phase Roadmap (All 6 Phases)](#6-complete-phase-roadmap)
7. [Free Deployment with Hugging Face Spaces](#7-free-deployment-with-hugging-face-spaces)
8. [Future Features — Become a Recruiter Magnet](#8-future-features--become-a-recruiter-magnet)
9. [What You Can Do With This Project](#9-what-you-can-do-with-this-project)
10. [Career Strategy and Resume Tips](#10-career-strategy-and-resume-tips)

---

## 1. Why Free

Many tutorials assume you'll pay $30-50/month for OpenAI, Pinecone, Cohere, Railway, and Vercel. You don't have to. This guide shows you how to build the exact same framework, with the exact same quality and recruiter impact, for $0 total — and keep it free forever.

### What You Give Up Going Free

Being honest: there are two real trade-offs, both minor for a portfolio project.

**Trade-off 1: Rate limits.** Gemini's free tier allows 1,500 requests/day. For development and even a modestly popular launched product, this is plenty. If your project goes viral and needs 100,000 requests/day, you'd happily pay $20/month then.

**Trade-off 2: Embedding dimensions.** Local sentence-transformers produce 384-dimensional embeddings vs OpenAI's 1536. At portfolio scale this makes no measurable retrieval quality difference.

### What You Gain Going Free

- Running local models proves you understand the full ML stack, not just API consumption
- Hugging Face Spaces deployment gives visibility on the platform AI researchers professionally use
- Your README can state: "Runs on free tier — zero ongoing infrastructure cost"
- You can keep the project online forever as a portfolio piece
- Demonstrates resourcefulness — a startup-founder trait top companies actively recruit for

> **Bottom line:** The free path is not a "lite" version. It's a more impressive project because anyone can pay for OpenAI. Few engineers can run their own embedding model and deploy a working RAG system without spending money.

---

## 2. Understanding RAG

### What is RAG?

RAG stands for **Retrieval Augmented Generation**. It combines two systems:
1. A search engine that finds relevant information from your private data
2. A Large Language Model (LLM) that uses that information to generate accurate, grounded answers

### Why RAG Matters

LLMs like Gemini and GPT-4 are trained on huge public datasets but have three critical limitations:

- They don't know anything about your private data (company docs, support tickets, internal wikis)
- Their knowledge is frozen at a training cutoff date
- When uncertain, they often hallucinate plausible-sounding but incorrect answers

RAG solves all three by retrieving real information first, then asking the LLM to answer based on that retrieved context.

### The Two-Phase Architecture

**Indexing Phase** (one-time per document):
Documents are loaded → broken into smaller chunks → converted to vector embeddings → stored in a vector database.

**Querying Phase** (every user question):
The user's question is converted to a vector → vector database finds the most similar chunks → those chunks are sent to the LLM along with the question → the LLM generates a grounded answer with citations.

### Why Your Framework Will Stand Out

LangChain and LlamaIndex are popular but notorious for being over-abstracted and difficult to debug. Your framework differentiates in three ways:

1. **Production-focused design** — observability, error handling, and evaluation built in from day one
2. **Hybrid search by default** — combining vector search with BM25 for 20-30% better accuracy
3. **Hallucination detection** — checking whether the LLM's claims are actually supported by retrieved context

Plus the bonus: it runs entirely on free tier.

---

## 3. The Complete $0 Stack

| Component | Paid Default | Free Alternative (Use This) |
|-----------|--------------|------------------------------|
| LLM for generation | OpenAI GPT-4o-mini ($0.15/M tokens) | **Gemini 2.0 Flash** via Google AI Studio (1500 req/day FREE) |
| Embeddings | OpenAI text-embedding-3-small ($0.02/M tokens) | **sentence-transformers** (local, free forever, runs on CPU) |
| Vector database | Pinecone ($70/month minimum) | **Qdrant local via Docker** (dev), **Qdrant Cloud free 1GB** (prod) |
| Reranker | Cohere Rerank ($1 per 1000 searches) | **cross-encoder/ms-marco-MiniLM** (local, free) |
| Backend hosting | Railway ($5/month) | **Hugging Face Spaces** (16GB RAM, FREE forever) |
| Database | Railway Postgres ($5/month) | **Supabase** free tier (500MB, unlimited requests) |
| Frontend hosting | Vercel Pro ($20/month) | **Vercel free tier** (100GB bandwidth) |
| Container runtime | Docker Desktop | Docker Desktop (free for personal use) |
| **Total monthly cost** | **~$30-50/month** | **$0 forever** |

### Why Each Free Tool Works

**Gemini 2.0 Flash (LLM):** Google offers Gemini Flash free through Google AI Studio with 1,500 requests/day and 1M tokens/minute. Quality is comparable to GPT-4o-mini for RAG tasks. No credit card required.

**sentence-transformers (Embeddings):** Open-source library that runs embedding models locally on your CPU. The `all-MiniLM-L6-v2` model is 80MB, downloads once, runs forever offline. Speed: ~500 chunks/second on a normal laptop.

**Qdrant (Vector DB):** Open-source Rust-based vector database. Runs locally via Docker for free. Qdrant Cloud's free tier gives 1GB storage — enough for 100,000+ document chunks.

**Hugging Face Spaces (Hosting):** Free forever for public projects with 16GB RAM and 2 vCPUs. Auto-deploys from git push. Bonus: Hugging Face is the platform AI engineers professionally use — recruiters at AI companies actively browse HF profiles.

**Supabase (Database + Auth):** Open-source Firebase alternative. Free tier includes 500MB PostgreSQL, unlimited API requests, built-in authentication, and row-level security.

---

## 4. Phase 1 — Document Ingestion and Chunking

> **Goal:** Take any document (PDF, HTML, text, markdown) and break it into intelligently-sized chunks ready for embedding.
>
> **Duration:** 1-2 weeks
> **Cost:** $0 (no API dependencies)
> **Status:** Foundation phase — start here

### 4.1 What Phase 1 Achieves

- Loads any document format — PDF, HTML, Markdown, plain text
- Normalizes text — removes weird whitespace, PDF artifacts, HTML entities
- Chunks intelligently — respects paragraph and sentence boundaries
- Token-aware — uses tiktoken for accurate token counts
- Configurable overlap — adjacent chunks share context for better retrieval
- Citation ready — every chunk tracks source file, position, and page number

### 4.2 Step-by-Step Setup

#### Step 1: Create the GitHub Repository

1. Go to github.com and sign in
2. Click `+` → New repository
3. Settings:
   - **Repository name:** `rag-framework`
   - **Description:** A production-grade RAG framework that runs on free tier
   - **Visibility:** Public
   - **Initialize with README:** Yes
   - **.gitignore:** Python
   - **License:** MIT
4. Click "Create repository"

#### Step 2: Clone to Your Computer

Replace `YOUR-USERNAME` with your GitHub username:

```bash
cd Desktop
cd Projects
git clone https://github.com/YOUR-USERNAME/rag-framework.git
cd rag-framework
code .
```

#### Step 3: Create the Folder Structure

In VS Code's terminal (press `Ctrl+`` `):

```bash
mkdir rag
mkdir tests
mkdir scripts
```

#### Step 4: Create All Python Files

**Windows PowerShell:**
```powershell
New-Item rag/__init__.py -ItemType File
New-Item rag/models.py -ItemType File
New-Item rag/loaders.py -ItemType File
New-Item rag/chunker.py -ItemType File
New-Item rag/ingestion.py -ItemType File
New-Item __main__.py -ItemType File
New-Item tests/__init__.py -ItemType File
New-Item tests/test_phase1.py -ItemType File
New-Item requirements.txt -ItemType File
```

**Mac/Linux:**
```bash
touch rag/__init__.py rag/models.py rag/loaders.py rag/chunker.py rag/ingestion.py
touch __main__.py requirements.txt
touch tests/__init__.py tests/test_phase1.py
```

#### Step 5: Required File Structure

```
rag-framework/
├── __main__.py              # CLI entry point (ROOT level)
├── requirements.txt
├── README.md
├── .gitignore
├── LICENSE
├── rag/                     # Python package
│   ├── __init__.py          # EMPTY
│   ├── models.py            # Document and Chunk dataclasses
│   ├── loaders.py           # PDF, HTML, text loaders
│   ├── chunker.py           # SemanticChunker
│   └── ingestion.py         # IngestionPipeline
└── tests/
    ├── __init__.py          # EMPTY
    └── test_phase1.py       # 32 tests
```

> ⚠️ **CRITICAL:** `__main__.py` goes in the project root, NOT inside the `rag/` folder. This is required for `python -m rag` to work.

#### Step 6: requirements.txt

```
pypdf>=4.0.0
tiktoken>=0.7.0
pytest>=8.0.0
```

#### Step 7: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 8: Run Tests

```bash
python -m pytest tests/ -v
```

**Expected output:** 32 tests pass.

#### Step 9: Try the CLI

```bash
echo "# My First Document" > test.md
echo "This is some content for testing." >> test.md
python __main__.py ingest test.md --max-tokens 100 --overlap 20
```

#### Step 10: Push to GitHub

```bash
git add .
git commit -m "feat: Phase 1 - document ingestion and chunking"
git push origin main
```

### 4.3 Code Files for Phase 1

The actual code for `models.py`, `loaders.py`, `chunker.py`, `ingestion.py`, `__main__.py`, and `test_phase1.py` is already in your project from Claude's earlier session. If you need to regenerate any of these files, ask Claude Code: "regenerate the Phase 1 code based on the spec in GUIDE.md Section 4."

### 4.4 Understanding the Phase 1 Components

**`models.py`** — Defines two dataclasses: `Document` (raw file loaded) and `Chunk` (a piece after splitting). Each Chunk tracks position, index, token count, and source — enabling citations later.

**`loaders.py`** — Three loader functions: `load_text`, `load_html` (uses Python stdlib HTMLParser, no external deps), `load_pdf` (uses pypdf). `normalize_text` cleans up whitespace artifacts. Smart `load_document` dispatcher picks the right loader by file extension.

**`chunker.py`** — The heart of the system. `SemanticChunker` uses recursive splitting:
1. Try whole text first
2. Split on paragraphs (blank lines)
3. Split on sentences if paragraphs too large
4. Split on words as last resort

This recursive approach beats naive char-splitting because it preserves semantic boundaries. The overlap mechanism prepends the last few tokens of one chunk to the next — preventing information loss at boundaries.

**`ingestion.py`** — High-level `IngestionPipeline` wraps loaders and chunker. Handles failures gracefully — corrupt PDFs don't crash the whole run.

---

## 5. Phase 2 — Free Embeddings and Vector Storage

> **Goal:** Take Phase 1's chunks and make them searchable using vector embeddings, then generate grounded answers — all on free tier.
>
> **Duration:** 1 week
> **Cost:** $0 (Gemini free API + local sentence-transformers + Qdrant Docker)

### 5.1 What Phase 2 Achieves

- Generate vector embeddings using FREE local model (sentence-transformers)
- Store vectors in Qdrant, an open-source vector database running locally
- Generate answers using FREE Gemini API
- Perform semantic search to find chunks similar to any query
- Zero ongoing cost, zero API charges, runs offline once set up

### 5.2 Key Concepts

**Embeddings:** A list of numbers (a vector) representing the meaning of text. Similar meanings → similar vectors, even with no shared keywords. "How do I cancel my subscription?" and "I want to end my membership" produce very similar vectors.

We use sentence-transformers locally — `all-MiniLM-L6-v2` produces 384-dim embeddings, downloads once (80MB), runs forever offline.

**Vector Database:** Specialized storage optimized for finding nearest neighbors in high-dimensional space. Given a query vector, finds closest stored vectors in milliseconds. We use Qdrant locally via Docker.

### 5.3 Step-by-Step Setup

#### Step 1: Get Your Free Gemini API Key

1. Go to `aistudio.google.com` and sign in with Google account
2. Click "Get API key" in left sidebar
3. Click "Create API key" → select or create a Google Cloud project
4. Copy the key, save it (you'll add to .env in Step 5)

> **Free tier limits:** 1,500 requests/day, 1M tokens/minute. No credit card required.

#### Step 2: Install Docker Desktop

Download from `docker.com/products/docker-desktop`, install with defaults.

Verify:
```bash
docker --version
```

#### Step 3: Run Qdrant Locally

Open a **NEW terminal window** (keep running during development):

```bash
docker run -p 6333:6333 -p 6334:6334 -v qdrant_storage:/qdrant/storage qdrant/qdrant
```

Qdrant runs on `http://localhost:6333`. Open in browser to see its dashboard. Leave this terminal running.

#### Step 4: Update requirements.txt

Add to existing file:

```
# Phase 2 - free stack
sentence-transformers>=3.0.0
google-generativeai>=0.8.0
qdrant-client>=1.9.0
python-dotenv>=1.0.0
numpy>=1.26.0
```

Install:
```bash
pip install -r requirements.txt
```

> First install takes 5-10 minutes — sentence-transformers downloads ML model files.

#### Step 5: Environment Variables

Create `.env` in project root:

```env
GEMINI_API_KEY=your-gemini-key-here
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=rag_chunks
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

Verify `.env` is in `.gitignore`:
```bash
# Windows
type .env >> .gitignore

# Mac/Linux
echo .env >> .gitignore
```

> ⚠️ **NEVER commit your .env file.** Even though Gemini is free, treating API keys carelessly is a bad habit.

#### Step 6: Create Phase 2 Files

**Windows:**
```powershell
New-Item rag/embeddings.py -ItemType File
New-Item rag/vectorstore.py -ItemType File
New-Item rag/generator.py -ItemType File
New-Item rag/config.py -ItemType File
New-Item tests/test_phase2.py -ItemType File
```

**Mac/Linux:**
```bash
touch rag/embeddings.py rag/vectorstore.py rag/generator.py rag/config.py
touch tests/test_phase2.py
```

### 5.4 Code Files for Phase 2

#### `rag/config.py`

```python
"""Centralized configuration loaded from environment variables."""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")  # None for local
COLLECTION_NAME = os.getenv("QDRANT_COLLECTION", "rag_chunks")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
EMBEDDING_DIMS = 384  # all-MiniLM-L6-v2 produces 384-dim vectors
LLM_MODEL = "gemini-2.0-flash"
```

#### `rag/embeddings.py` — Free Local Embeddings

```python
"""Free local embeddings using sentence-transformers.

No API calls, no rate limits, no costs. Downloads model once (~80MB),
then runs entirely offline on CPU.
"""
from sentence_transformers import SentenceTransformer
from .config import EMBEDDING_MODEL


class Embedder:
    """Wraps sentence-transformers for batch and single embedding."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model = SentenceTransformer(model_name)
        self.dims = self.model.get_sentence_embedding_dimension()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embed a batch of texts. Returns list of float vectors."""
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            show_progress_bar=False,
            batch_size=32,
        )
        return embeddings.tolist()

    def embed_query(self, query: str) -> list[float]:
        """Embed a single query."""
        return self.embed_texts([query])[0]
```

#### `rag/vectorstore.py` — Qdrant Integration

```python
"""Qdrant vector database wrapper.

Stores chunks with their embeddings and performs nearest-neighbor search.
Works for both local Qdrant (Docker) and Qdrant Cloud free tier.
"""
import uuid
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

from .config import QDRANT_URL, QDRANT_API_KEY, COLLECTION_NAME, EMBEDDING_DIMS
from .models import Chunk


class VectorStore:

    def __init__(self, url: str = QDRANT_URL, collection: str = COLLECTION_NAME):
        # API key is optional - None for local, set for Qdrant Cloud
        self.client = QdrantClient(url=url, api_key=QDRANT_API_KEY)
        self.collection = collection
        self._ensure_collection()

    def _ensure_collection(self):
        existing = [c.name for c in self.client.get_collections().collections]
        if self.collection not in existing:
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(
                    size=EMBEDDING_DIMS,
                    distance=Distance.COSINE,
                ),
            )

    def upsert(self, chunks: list[Chunk], embeddings: list[list[float]]) -> int:
        """Store chunks with their pre-computed embeddings."""
        points = []
        for chunk, vec in zip(chunks, embeddings):
            points.append(PointStruct(
                id=str(uuid.uuid4()),
                vector=vec,
                payload={
                    "text": chunk.text,
                    "source": chunk.source,
                    "chunk_index": chunk.chunk_index,
                    "doc_id": chunk.doc_id,
                    "token_count": chunk.token_count,
                },
            ))
        self.client.upsert(collection_name=self.collection, points=points)
        return len(points)

    def search(self, query_vector: list[float], top_k: int = 5):
        """Return top_k most similar chunks with scores."""
        results = self.client.search(
            collection_name=self.collection,
            query_vector=query_vector,
            limit=top_k,
        )
        return [(r.payload, r.score) for r in results]

    def count(self) -> int:
        """Return total number of stored chunks."""
        return self.client.count(self.collection).count
```

#### `rag/generator.py` — Free Gemini Generation

```python
"""Free LLM generation using Google's Gemini API.

Free tier: 1500 requests/day, 1M tokens/minute.
No credit card required.
"""
import google.generativeai as genai
from .config import GEMINI_API_KEY, LLM_MODEL


class Generator:

    def __init__(self, model: str = LLM_MODEL):
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY not set. Get one at aistudio.google.com"
            )
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel(model)

    def generate(self, query: str, context_chunks: list[dict]) -> str:
        """Generate a grounded answer from query + retrieved chunks.

        context_chunks: list of dicts with 'text' and 'source' keys
        """
        context = "\n\n---\n\n".join([
            f"[Source: {c.get('source', 'unknown')}]\n{c.get('text', '')}"
            for c in context_chunks
        ])

        prompt = f"""Answer the question using ONLY the context below.
If the context does not contain the answer, say so honestly.
Cite sources by name when you use them.

Context:
{context}

Question: {query}

Answer:"""
        response = self.model.generate_content(prompt)
        return response.text
```

#### Update `__main__.py` — Add Phase 2 Commands

Add these handlers and parsers to your existing `__main__.py`:

```python
# Add these functions

def cmd_embed_and_store(args):
    """Ingest a file, embed chunks, store in Qdrant."""
    from rag.ingestion import IngestionPipeline
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore

    pipeline = IngestionPipeline()
    embedder = Embedder()
    store = VectorStore()

    chunks = pipeline.ingest_file(args.file)
    print(f"Created {len(chunks)} chunks. Embedding...")

    embeddings = embedder.embed_texts([c.text for c in chunks])
    count = store.upsert(chunks, embeddings)
    print(f"Stored {count} chunks in Qdrant.")


def cmd_search(args):
    """Search the vector store and return top chunks."""
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore

    embedder = Embedder()
    store = VectorStore()

    query_vec = embedder.embed_query(args.query)
    results = store.search(query_vec, top_k=args.top_k)

    print(f"\nTop {len(results)} results for: {args.query}\n")
    for i, (payload, score) in enumerate(results, 1):
        preview = payload["text"][:150].replace("\n", " ")
        print(f"[{i}] score={score:.3f} source={payload['source']}")
        print(f"    {preview}...\n")


def cmd_ask(args):
    """Full RAG pipeline: search + generate grounded answer."""
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore
    from rag.generator import Generator

    embedder = Embedder()
    store = VectorStore()
    generator = Generator()

    query_vec = embedder.embed_query(args.query)
    results = store.search(query_vec, top_k=5)
    chunks = [payload for payload, _ in results]

    print(f"\nQuestion: {args.query}\n")
    print("Retrieving relevant context...")
    answer = generator.generate(args.query, chunks)
    print(f"\nAnswer:\n{answer}\n")


# Add to argparse setup in main():

p_es = sub.add_parser("embed-and-store", help="Ingest, embed, and store a file")
p_es.add_argument("file")
p_es.set_defaults(func=cmd_embed_and_store)

p_sr = sub.add_parser("search", help="Search vector store for a query")
p_sr.add_argument("query")
p_sr.add_argument("--top-k", type=int, default=5)
p_sr.set_defaults(func=cmd_search)

p_ask = sub.add_parser("ask", help="Full RAG: search + generate answer")
p_ask.add_argument("query")
p_ask.set_defaults(func=cmd_ask)
```

### 5.5 Test the Full Pipeline

Ensure Qdrant is running, then:

```bash
# Embed a document and store it
python __main__.py embed-and-store sample.pdf

# Search for relevant chunks
python __main__.py search "What is the refund policy?"

# Get a complete RAG answer
python __main__.py ask "What is the refund policy?"
```

### 5.6 Push Phase 2 to GitHub

```bash
git add .
git commit -m "feat: Phase 2 - free embeddings (sentence-transformers) + Gemini generation"
git push origin main
```

---

## 6. Complete Phase Roadmap

| Phase | Focus | Free Tool | Duration | Status |
|-------|-------|-----------|----------|--------|
| 1 | Document ingestion + chunking | pypdf, tiktoken | 1-2 weeks | ✅ Done (per guide) |
| 2 | Free embeddings + Qdrant + Gemini | sentence-transformers, Gemini, Qdrant | 1 week | 🔨 Current focus |
| 3 | Hybrid search with BM25 | rank-bm25 (Python lib) | 1 week | ⏳ Next |
| 4 | Reranking + citation tracking | local cross-encoder | 1 week | ⏳ Pending |
| 5 | RAGAS evaluation framework | Gemini as LLM judge | 1-2 weeks | ⏳ Pending |
| 6 | Dashboard + API + HF Spaces deploy | FastAPI, Next.js, HF Spaces | 2 weeks | ⏳ Pending |

### Phase 3 — Hybrid Search with BM25

Vector search excels at semantic similarity but struggles with exact matches (product codes, error strings, names, version numbers). BM25 complements it perfectly.

**Tasks:**
- Use the free `rank-bm25` Python library (`pip install rank-bm25`)
- Build a hybrid retriever that queries both vector and BM25 indexes in parallel
- Apply Reciprocal Rank Fusion to merge results into a single ranked list
- Benchmark hybrid vs vector-only on a test dataset — expect 20-30% accuracy boost

### Phase 4 — Reranking and Citation Tracking

Use a local cross-encoder model from Hugging Face (free, runs on CPU).

**Tasks:**
- Use `cross-encoder/ms-marco-MiniLM-L-6-v2` (downloads via sentence-transformers, free)
- Take top 20 vector search results, re-rank to top 5 by true relevance
- Track which retrieved chunks support each claim in the LLM's answer
- Generate answers with inline citations

### Phase 5 — Evaluation Framework (RAGAS)

Use Gemini itself as the LLM judge — all free.

**The four metrics:**
- **Faithfulness:** Does the answer match the retrieved context, or is the LLM hallucinating?
- **Context Relevance:** Are the retrieved chunks actually relevant to the question?
- **Context Recall:** Did we retrieve all the necessary information?
- **Answer Relevance:** Does the final answer actually address what was asked?

Each metric uses Gemini to score answers against ground truth. The output is a quality report — this is the moat that wins interviews.

### Phase 6 — Dashboard, API, and Free Deployment

**Tasks:**
- Build a Next.js web dashboard for uploading documents, querying, viewing traces
- Expose a clean REST API using FastAPI
- Add user authentication with Supabase (free tier)
- Containerize everything with Docker
- Deploy backend to Hugging Face Spaces (free, 16GB RAM)
- Deploy frontend to Vercel free tier
- Connect Qdrant Cloud free tier (1GB) for production vector storage

---

## 7. Free Deployment with Hugging Face Spaces

### Why Hugging Face Spaces Beats Railway

For an AI/ML portfolio project, HF Spaces is strictly better than Railway or Vercel:

- Free forever for public Spaces (no time limits, no spin-down)
- 16GB RAM, 2 vCPUs (more than Railway free tier)
- 50GB persistent storage
- Auto-deploys from git push
- Recruiters at AI companies actively browse HF profiles
- Your Space doubles as a portfolio listing
- Built-in support for ML model files and Docker

### Deployment Steps

#### Step 1: Create a Hugging Face Account

Go to `huggingface.co` and sign up. Use your real name — this becomes your portfolio identity in the AI community.

#### Step 2: Create a New Space

1. Click your profile photo → New Space
2. Settings:
   - **Name:** `rag-framework`
   - **License:** MIT
   - **Space SDK:** Docker
   - **Hardware:** Free CPU basic (16GB RAM, 2 vCPUs)
   - **Visibility:** Public
3. Click Create Space

#### Step 3: Clone the Space Repo Locally

```bash
git clone https://huggingface.co/spaces/YOUR-USERNAME/rag-framework hf-space
cd hf-space
```

#### Step 4: Add a Dockerfile to the Root

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# System deps for ML libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD ["uvicorn", "rag.api:app", "--host", "0.0.0.0", "--port", "7860"]
```

#### Step 5: Add Your Gemini Key as a Secret

In the HF Space, click **Settings → Variables and secrets → New secret**:
- **Name:** `GEMINI_API_KEY`
- **Value:** your-key-here

HF Spaces injects these as environment variables. NEVER hardcode keys.

#### Step 6: Use Qdrant Cloud Free Tier

1. Go to `cloud.qdrant.io` and sign up
2. Create a free cluster (1GB storage)
3. Copy the cluster URL and API key
4. Add both as HF Space secrets:
   - `QDRANT_URL`: `https://your-cluster.qdrant.io`
   - `QDRANT_API_KEY`: your-qdrant-key

#### Step 7: Push to Deploy

Copy your code into `hf-space` folder, then:

```bash
git add .
git commit -m "feat: initial deployment"
git push origin main
```

HF auto-builds the Docker image and deploys. First build takes 5-10 minutes. Subsequent pushes redeploy in 2-3 minutes.

#### Step 8: Verify Your Live App

Your app is live at:
```
https://YOUR-USERNAME-rag-framework.hf.space
```

Share this URL on your resume, LinkedIn, and Twitter.

---

## 8. Future Features — Become a Recruiter Magnet

### Tier 1 — High Impact Features

1. **Multi-Modal RAG (Vision + Text)** — Extend to handle images, charts, diagrams. Gemini 2.0 Flash has free vision capabilities built in.

2. **Agentic RAG with Tool Use** — Build an agent that decides what to retrieve, queries multiple knowledge bases, refines queries if results are bad. Gemini's function calling API (free) supports this directly.

3. **Streaming Responses** — Make answers stream token-by-token like ChatGPT. Gemini supports streaming natively.

4. **Multi-Tenancy** — Allow multiple users and organizations with isolated knowledge bases. Use Supabase Row Level Security.

5. **Real-Time Document Updates** — When a document changes, re-index only affected chunks. Implement file watchers and incremental indexing.

### Tier 2 — Differentiating Features

6. **Local-Only Mode with Ollama** — Support fully offline mode with Ollama (Llama 3.3, Mistral). Healthcare, legal, finance companies look for this.

7. **Query Decomposition** — Use Gemini to break complex questions into sub-queries.

8. **Conversational Memory** — Multi-turn conversations with context retention. Use Supabase to persist sessions.

9. **Custom Embeddings Fine-Tuning** — Use sentence-transformers' built-in fine-tuning to adapt models to your domain.

10. **Observability Dashboard** — LangSmith-style trace capture for every query.

### Tier 3 — Polish Features

11. Auto-generated documentation site (MkDocs — free)
12. Benchmark suite comparing your framework to LangChain
13. Browser extension for one-click webpage indexing
14. Slack and Discord bots
15. Technical blog posts on dev.to, Hacker News, Medium

---

## 9. What You Can Do With This Project

### Use Cases You Can Build On Top

- **Internal Company Knowledge Base** — employees query internal docs via Slack
- **Legal Contract Analyzer** — upload contracts, ask questions, get cited answers
- **Medical Literature Assistant** — query thousands of research papers
- **Customer Support Bot** — auto-answer from product documentation
- **Personal Research Assistant** — chat with your notes, PDFs, bookmarks
- **Codebase Q&A** — index code, answer questions about it (Cursor-style)
- **Academic Paper Summarizer** — upload papers, get summaries with citations
- **Compliance Document Search** — help compliance teams find policy answers

### How to Monetize (When You Want To)

**1. Hosted SaaS:**
- Free: 100 queries/month, 10 documents (covered by Gemini free tier)
- Pro ($29/month): 5,000 queries, 1,000 documents
- Team ($99/month): 50,000 queries, unlimited documents
- Enterprise (custom): on-prem deployment, SSO, audit logs

**2. Open Core:** Core framework free, charge for advanced features. Used by Supabase, PostHog, Plausible.

**3. Consulting:** Companies pay $50-200/hour for engineers who can deliver real RAG systems. Your project is the proof.

---

## 10. Career Strategy and Resume Tips

### How to Write This On Your Resume

**Bad bullet:**
```
- Built a RAG system with LangChain
```

**Good bullets:**
```
Production RAG Framework | Python, FastAPI, Qdrant, Gemini, sentence-transformers
- Engineered an open-source RAG framework with hybrid retrieval (BM25 + vector
  search via RRF), achieving 87% faithfulness on RAGAS benchmark across 1,000
  test queries — 23% higher than LangChain baseline.
- Built an evaluation framework with LLM-as-judge scoring across 4 metrics,
  enabling systematic regression testing of prompt changes.
- Designed entire stack to run on free tier (Gemini + sentence-transformers +
  Qdrant + HF Spaces) demonstrating production engineering on zero-cost budget.
- Deployed to Hugging Face Spaces; 50+ active users and 200+ GitHub stars
  within 3 months of launch.
```

### The Three Things Recruiters Look For

1. **Scope** — did you build something non-trivial? (Yes — 6 phases over 2 months)
2. **Quality** — is it well-engineered? (Yes — full test suite + eval framework)
3. **Impact** — does anyone use it? (Yes — real users + GitHub stars)

### Interview Talking Points

This project gives you stories for every interview question:

- **Hard technical challenge:** chunk boundary handling in RAG
- **Debug production issues:** your observability layer
- **System design:** your hybrid search architecture
- **Project leadership:** this entire framework
- **Handle scale:** vector DB sharding decisions
- **Ensure quality:** RAGAS evaluation framework
- **Cost optimization:** shipping on free tier without quality loss
- **Cloud architecture:** HF Spaces + Qdrant Cloud + Supabase stack

### Companies That Hire For This

- **AI Infrastructure:** Anthropic, OpenAI, Cohere, Together AI, Mistral
- **Search and RAG specialists:** Pinecone, Qdrant, Weaviate, Vespa
- **Dev tools with AI:** GitHub, Cursor, Sourcegraph, JetBrains
- **Big Tech AI teams:** Google DeepMind, Meta AI, Apple AI/ML
- **AI-first startups:** Perplexity, Glean, Sierra, Harvey, Decagon
- **Indian companies:** Razorpay, Postman, Atlan, Hasura, Browserstack, Fold AI

### Final Advice

1. **Build in public** — commit daily, tweet your progress, write blog posts as you go
2. **Polish matters** — great README, clean code, good docs, demo video
3. **Use your project to network** — reach out to engineers at target companies
4. **Don't be shy about the free stack** — it's a feature, not a limitation
5. **Ship early, iterate often** — 80% done and live beats 100% done in your head

---

## Quick Reference for Claude Code

When using this guide with Claude Code, useful commands:

```
# Start a new phase
"Read GUIDE.md Section 4 and start Phase 1 from Step 1"

# Continue where you left off
"Look at git log and tell me which phase I'm on, then continue from there"

# Implement a specific file
"Implement rag/embeddings.py per the spec in GUIDE.md Section 5.4"

# Run tests
"Run all tests and tell me what failed"

# Debug an error
"I got this error: [paste]. Check GUIDE.md to see what could be wrong"

# Deploy
"Deploy to Hugging Face Spaces per GUIDE.md Section 7"

# Add a new feature
"Implement multi-modal RAG per GUIDE.md Section 8 Tier 1, Feature 1"
```

---

> **Build it. Ship it. Land the job.**
>
> Total cost: zero. Total impact: maximum.
