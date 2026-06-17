#!/usr/bin/env python3
"""
ragframework — CLI for the production RAG framework.

Usage:
    python -m rag ingest <file>           Show chunks for one file
    python -m rag ingest-dir <directory>  Ingest a whole directory
    python -m rag stats <file>            Show document stats without chunking
"""

import sys
import argparse
from pathlib import Path

from rag.loaders import load_document
from rag.chunker import SemanticChunker, TokenCounter
from rag.ingestion import IngestionPipeline


def cmd_ingest(args):
    """Show the chunks for a single file."""
    chunker = SemanticChunker(
        max_tokens=args.max_tokens,
        overlap_tokens=args.overlap,
    )
    pipeline = IngestionPipeline(chunker=chunker)
    chunks = pipeline.ingest_file(args.file)

    print(f"\n  Source: {args.file}")
    print(f"  Chunks: {len(chunks)}")
    print(f"  Total tokens: {sum(c.token_count for c in chunks)}")
    print()

    for c in chunks:
        preview = c.text[:120].replace("\n", " ")
        print(f"  [{c.chunk_index:>3}] {c.token_count:>4} tok  {preview}...")


def cmd_ingest_dir(args):
    """Ingest a whole directory."""
    pipeline = IngestionPipeline(chunker=SemanticChunker(
        max_tokens=args.max_tokens,
        overlap_tokens=args.overlap,
    ))
    chunks, stats = pipeline.ingest_directory(args.directory, verbose=True)

    print(f"\n  Documents loaded: {stats.documents_loaded}")
    print(f"  Documents failed: {stats.documents_failed}")
    print(f"  Total chunks: {stats.chunks_created}")
    if stats.failed_files:
        print("\n  Failures:")
        for f in stats.failed_files:
            print(f"    - {f}")


def cmd_stats(args):
    """Show document-level stats without chunking."""
    doc = load_document(args.file)
    counter = TokenCounter()

    print(f"\n  Source: {doc.source}")
    print(f"  Format: {doc.metadata.get('format')}")
    print(f"  Characters: {len(doc.content):,}")
    print(f"  Tokens: {counter.count(doc.content):,}")
    print(f"  Metadata: {doc.metadata}")


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


def cmd_hybrid_search(args):
    """Hybrid search: BM25 + vector search fused with Reciprocal Rank Fusion."""
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore
    from rag.hybrid_retriever import HybridRetriever

    embedder = Embedder()
    store = VectorStore()
    retriever = HybridRetriever(vector_store=store, embedder=embedder)

    print("Building BM25 index from Qdrant...")
    count = retriever.build_bm25_index_from_store()
    print(f"Indexed {count} chunks.\n")

    results = retriever.search(args.query, top_k=args.top_k)

    print(f"Top {len(results)} hybrid results for: {args.query}\n")
    for i, (payload, score) in enumerate(results, 1):
        preview = payload["text"][:150].replace("\n", " ")
        print(f"[{i}] rrf_score={score:.4f}  source={payload['source']}")
        print(f"    {preview}...\n")


def cmd_hybrid_ask(args):
    """Full RAG pipeline with hybrid retrieval: BM25 + vector + LLM answer."""
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore
    from rag.hybrid_retriever import HybridRetriever
    from rag.generator import Generator

    embedder = Embedder()
    store = VectorStore()
    retriever = HybridRetriever(vector_store=store, embedder=embedder)
    generator = Generator()

    print("Building BM25 index from Qdrant...")
    count = retriever.build_bm25_index_from_store()
    print(f"Indexed {count} chunks.")

    results = retriever.search(args.query, top_k=5)
    chunks = [payload for payload, _ in results]

    print(f"\nQuestion: {args.query}\n")
    print("Retrieving relevant context (hybrid: vector + BM25)...")
    answer = generator.generate(args.query, chunks)
    print(f"\nAnswer:\n{answer}\n")


def cmd_rerank_search(args):
    """Hybrid search followed by cross-encoder reranking."""
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore
    from rag.hybrid_retriever import HybridRetriever
    from rag.reranker import Reranker
    from rag.config import RERANK_FETCH_N

    embedder = Embedder()
    store = VectorStore()
    retriever = HybridRetriever(vector_store=store, embedder=embedder)
    reranker = Reranker()

    print("Building BM25 index from Qdrant...")
    count = retriever.build_bm25_index_from_store()
    print(f"Indexed {count} chunks.")

    candidates = retriever.search(args.query, top_k=RERANK_FETCH_N)
    candidate_payloads = [payload for payload, _ in candidates]

    print(f"\nReranking {len(candidate_payloads)} candidates with cross-encoder...\n")
    reranked = reranker.rerank(args.query, candidate_payloads, top_n=args.top_k)

    print(f"Top {len(reranked)} reranked results for: {args.query}\n")
    for i, (payload, score) in enumerate(reranked, 1):
        preview = payload["text"][:150].replace("\n", " ")
        print(f"[{i}] rerank_score={score:.4f}  source={payload['source']}")
        print(f"    {preview}...\n")


def cmd_cited_ask(args):
    """Full pipeline: hybrid retrieval → reranking → cited answer with [N] markers."""
    from rag.embeddings import Embedder
    from rag.vectorstore import VectorStore
    from rag.hybrid_retriever import HybridRetriever
    from rag.reranker import Reranker
    from rag.generator import Generator
    from rag.config import RERANK_FETCH_N, RERANK_TOP_N

    embedder = Embedder()
    store = VectorStore()
    retriever = HybridRetriever(vector_store=store, embedder=embedder)
    reranker = Reranker()
    generator = Generator()

    print("Building BM25 index from Qdrant...")
    count = retriever.build_bm25_index_from_store()
    print(f"Indexed {count} chunks.")

    candidates = retriever.search(args.query, top_k=RERANK_FETCH_N)
    candidate_payloads = [payload for payload, _ in candidates]

    print(f"Reranking {len(candidate_payloads)} candidates...")
    reranked = reranker.rerank(args.query, candidate_payloads, top_n=RERANK_TOP_N)
    chunks = [payload for payload, _ in reranked]

    print(f"\nQuestion: {args.query}\n")
    result = generator.generate_with_citations(args.query, chunks)

    print(f"Answer:\n{result.answer}\n")

    if result.citations:
        print("Sources cited:")
        for i, src in enumerate(result.cited_sources, 1):
            print(f"  [{i}] {src}")
    else:
        print("(No inline citations detected in the answer.)")


def main():
    parser = argparse.ArgumentParser(prog="rag",
                                     description="Production RAG framework")
    sub = parser.add_subparsers(dest="command")

    p_ing = sub.add_parser("ingest", help="Ingest one file and show chunks")
    p_ing.add_argument("file")
    p_ing.add_argument("--max-tokens", type=int, default=512)
    p_ing.add_argument("--overlap", type=int, default=64)
    p_ing.set_defaults(func=cmd_ingest)

    p_dir = sub.add_parser("ingest-dir", help="Ingest a whole directory")
    p_dir.add_argument("directory")
    p_dir.add_argument("--max-tokens", type=int, default=512)
    p_dir.add_argument("--overlap", type=int, default=64)
    p_dir.set_defaults(func=cmd_ingest_dir)

    p_st = sub.add_parser("stats", help="Show document statistics")
    p_st.add_argument("file")
    p_st.set_defaults(func=cmd_stats)

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

    p_hs = sub.add_parser("hybrid-search", help="Hybrid search (BM25 + vector + RRF)")
    p_hs.add_argument("query")
    p_hs.add_argument("--top-k", type=int, default=5)
    p_hs.set_defaults(func=cmd_hybrid_search)

    p_ha = sub.add_parser("hybrid-ask", help="Hybrid RAG: BM25 + vector + LLM answer")
    p_ha.add_argument("query")
    p_ha.set_defaults(func=cmd_hybrid_ask)

    p_rr = sub.add_parser("rerank-search", help="Hybrid search + cross-encoder reranking")
    p_rr.add_argument("query")
    p_rr.add_argument("--top-k", type=int, default=5)
    p_rr.set_defaults(func=cmd_rerank_search)

    p_ca = sub.add_parser("cited-ask", help="Full pipeline with citations: hybrid + rerank + LLM")
    p_ca.add_argument("query")
    p_ca.set_defaults(func=cmd_cited_ask)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)
    args.func(args)


if __name__ == "__main__":
    main()
