# RAG Framework — Production-Grade Retrieval Augmented Generation

A production-focused RAG framework built from scratch. Designed for real workloads with hybrid retrieval, citation tracking, hallucination detection, and built-in evaluation.

## Status

**Phase 1 — Document ingestion and chunking: COMPLETE** (32 tests passing)

Upcoming phases:
- Phase 2: Embeddings and vector storage (Qdrant integration)
- Phase 3: Hybrid search with BM25 + reciprocal rank fusion
- Phase 4: Reranking and citation tracking
- Phase 5: Evaluation framework (RAGAS-style metrics)
- Phase 6: Dashboard, API, and deployment

## What's working now

- **Multi-format document loading**: PDF, HTML, Markdown, plain text — all with metadata preserved
- **Semantic chunking**: Recursive splitting that respects paragraph, sentence, and word boundaries
- **Token-aware sizing**: Uses tiktoken for accurate OpenAI-compatible token counts
- **Configurable overlap**: Adjacent chunks share context to handle queries that span boundaries
- **Citation-ready**: Every chunk tracks its source file, position, and page (for PDFs)
- **Robust to bad input**: Corrupt files don't crash the pipeline; failures are reported, not raised

## Quick start

```bash
pip install -r requirements.txt

# Show chunks for one document
python __main__.py ingest path/to/document.pdf --max-tokens 512 --overlap 64

# Ingest a whole directory
python __main__.py ingest-dir path/to/docs/

# Show stats only (no chunking)
python __main__.py stats path/to/document.pdf
```

## Python API

```python
from rag.ingestion import IngestionPipeline
from rag.chunker import SemanticChunker

pipeline = IngestionPipeline(chunker=SemanticChunker(
    max_tokens=512,
    overlap_tokens=64,
))

# Single file
chunks = pipeline.ingest_file("contract.pdf")

# Whole directory
chunks, stats = pipeline.ingest_directory("docs/", recursive=True)
print(f"Loaded {stats.documents_loaded} documents into {stats.chunks_created} chunks")
```

## Architecture

```
rag/
├── models.py        # Document and Chunk dataclasses
├── loaders.py       # PDF, HTML, text loaders + normalization
├── chunker.py       # SemanticChunker with token-aware splitting
└── ingestion.py     # High-level pipeline combining loaders + chunker

__main__.py          # CLI entry point
tests/
└── test_phase1.py   # 32 tests covering all components
```

## Run tests

```bash
pytest tests/ -v
```

## Tech stack

Python 3.10+, pypdf, tiktoken, pytest. No heavy framework dependencies — every component is implemented in pure Python with clear, readable code.
