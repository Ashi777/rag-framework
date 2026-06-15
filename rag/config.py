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
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")
