"""
rag/vision.py

Multi-modal vision analysis using Gemini 2.0 Flash.

Two use cases:
1. Ingestion  — describe_image(path) converts an image file to a rich text
   description that gets chunked and stored in Qdrant like any other document.
2. Query time — answer_about_image(bytes, mime, query, chunks) lets Gemini
   reason over an uploaded image PLUS retrieved text context together.

Supported formats: PNG, JPEG, GIF, WebP.
Requires: GEMINI_API_KEY in .env (already needed for text generation).
"""

from pathlib import Path
from .config import GEMINI_API_KEY

# Maps file extension → IANA MIME type accepted by the Gemini API
SUPPORTED_IMAGE_EXTS: dict[str, str] = {
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif":  "image/gif",
    ".webp": "image/webp",
}

_DESCRIBE_PROMPT = (
    "Describe this image comprehensively so it can be indexed for semantic search:\n"
    "1. Extract ALL visible text verbatim (perform OCR).\n"
    "2. Describe any charts, graphs, or diagrams — include axis labels, data points, "
    "trends, and conclusions.\n"
    "3. Describe tables — list column headers and representative rows.\n"
    "4. Describe the overall subject, context, and key visual elements.\n"
    "Be thorough. Your description is the only searchable representation of this image."
)


class VisionAnalyzer:
    """Uses Gemini 2.0 Flash vision to analyze images for RAG pipelines."""

    def __init__(self, model: str = "gemini-2.0-flash"):
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY not set. Get one free at aistudio.google.com"
            )
        from google import genai
        self._client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = model

    def describe_image(self, path: str | Path) -> str:
        """
        Send an image file to Gemini and return a detailed text description.

        Called at ingestion time — the description becomes the Document content
        that is chunked, embedded, and stored in Qdrant.
        """
        from google.genai import types

        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"Image not found: {path}")

        mime_type = SUPPORTED_IMAGE_EXTS.get(path.suffix.lower(), "image/jpeg")
        image_bytes = path.read_bytes()

        response = self._client.models.generate_content(
            model=self.model,
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                types.Part.from_text(text=_DESCRIBE_PROMPT),
            ],
        )
        return response.text

    def answer_about_image(
        self,
        image_bytes: bytes,
        mime_type: str,
        query: str,
        context_chunks: list[dict] | None = None,
    ) -> str:
        """
        Answer a question about an uploaded image, grounded in retrieved context.

        Called at query time via the /ask-image endpoint. Gemini receives both
        the raw image pixels and any relevant text chunks retrieved from Qdrant.
        """
        from google.genai import types

        parts: list = [types.Part.from_bytes(data=image_bytes, mime_type=mime_type)]

        if context_chunks:
            context = "\n\n---\n\n".join(
                f"[Source: {c.get('source', 'unknown')}]\n{c.get('text', '')}"
                for c in context_chunks
            )
            prompt = (
                "Using the image above and the following context from the knowledge base, "
                "answer the question. Cite sources by name when you use them.\n\n"
                f"Context:\n{context}\n\n"
                f"Question: {query}\n\nAnswer:"
            )
        else:
            prompt = f"Answer this question about the image: {query}"

        parts.append(types.Part.from_text(text=prompt))

        response = self._client.models.generate_content(
            model=self.model,
            contents=parts,
        )
        return response.text
