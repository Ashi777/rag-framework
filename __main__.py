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

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        sys.exit(1)
    args.func(args)


if __name__ == "__main__":
    main()
