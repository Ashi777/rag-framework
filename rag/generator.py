"""LLM generation with pluggable free providers.

Supported providers (set LLM_PROVIDER in .env):
  gemini  — Google Gemini via google-genai (default). Needs GEMINI_API_KEY.
  groq    — Groq cloud via groq SDK. Needs GROQ_API_KEY. 14,400 req/day free.

Both are free tier, no credit card required.
"""
import os
import re
from typing import Iterator
from .config import GEMINI_API_KEY, LLM_MODEL

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")


class Generator:

    def __init__(self, model: str = LLM_MODEL):
        self.provider = LLM_PROVIDER
        self.model = model

        if self.provider == "groq":
            if not GROQ_API_KEY:
                raise ValueError("GROQ_API_KEY not set. Get one free at console.groq.com")
            from groq import Groq
            self._client = Groq(api_key=GROQ_API_KEY)

        elif self.provider == "gemini":
            if not GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not set. Get one at aistudio.google.com")
            from google import genai
            self._client = genai.Client(api_key=GEMINI_API_KEY)

        else:
            raise ValueError(f"Unknown LLM_PROVIDER '{self.provider}'. Choose 'gemini' or 'groq'.")

    def generate(self, query: str, context_chunks: list[dict]) -> str:
        """Generate a grounded answer from query + retrieved chunks."""
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

        if self.provider == "groq":
            groq_model = self.model if "llama" in self.model or "mixtral" in self.model or "gemma" in self.model \
                else "llama-3.3-70b-versatile"
            response = self._client.chat.completions.create(
                model=groq_model,
                messages=[{"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content

        else:  # gemini
            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            return response.text

    def generate_with_citations(self, query: str, context_chunks: list[dict]) -> "CitedAnswer":
        """Generate a grounded answer with inline [N] citation markers.

        Each chunk is numbered [1]..[N] in the prompt. The LLM is instructed
        to cite inline. Cited chunk indices are parsed from the response and
        returned in a CitedAnswer object.
        """
        from .models import CitedAnswer

        context_parts = [
            f"[{i}] [Source: {c.get('source', 'unknown')}]\n{c.get('text', '')}"
            for i, c in enumerate(context_chunks, 1)
        ]
        context = "\n\n---\n\n".join(context_parts)

        prompt = f"""Answer the question using ONLY the context below.
After each fact you use, add an inline citation like [1] or [2] that refers to the context number.
If the context does not contain the answer, say so honestly.

Context:
{context}

Question: {query}

Answer (with inline citations):"""

        if self.provider == "groq":
            groq_model = self.model if "llama" in self.model or "mixtral" in self.model or "gemma" in self.model \
                else "llama-3.3-70b-versatile"
            response = self._client.chat.completions.create(
                model=groq_model,
                messages=[{"role": "user", "content": prompt}],
            )
            answer_text = response.choices[0].message.content
        else:  # gemini
            response = self._client.models.generate_content(
                model=self.model,
                contents=prompt,
            )
            answer_text = response.text

        cited_nums = sorted(set(int(n) for n in re.findall(r'\[(\d+)\]', answer_text)))
        citations = [
            context_chunks[n - 1]
            for n in cited_nums
            if 1 <= n <= len(context_chunks)
        ]

        return CitedAnswer(answer=answer_text, citations=citations, query=query)

    def generate_stream(self, query: str, context_chunks: list[dict]) -> Iterator[str]:
        """Stream the answer token-by-token.

        Uses the same numbered-citation prompt as generate_with_citations so
        that [1] [2] markers appear inline in the streamed text. The caller is
        responsible for sending citation metadata as a separate event once
        streaming finishes.

        Yields:
            str — raw text fragments (one or more tokens each).
        """
        context_parts = [
            f"[{i}] [Source: {c.get('source', 'unknown')}]\n{c.get('text', '')}"
            for i, c in enumerate(context_chunks, 1)
        ]
        context = "\n\n---\n\n".join(context_parts) if context_parts else "(No context retrieved)"

        prompt = f"""Answer the question using ONLY the context below.
After each fact you use, add an inline citation like [1] or [2] that refers to the context number.
If the context does not contain the answer, say so honestly.

Context:
{context}

Question: {query}

Answer (with inline citations):"""

        if self.provider == "groq":
            groq_model = (
                self.model
                if any(k in self.model for k in ("llama", "mixtral", "gemma"))
                else "llama-3.3-70b-versatile"
            )
            stream = self._client.chat.completions.create(
                model=groq_model,
                messages=[{"role": "user", "content": prompt}],
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta

        else:  # gemini
            for chunk in self._client.models.generate_content_stream(
                model=self.model,
                contents=prompt,
            ):
                if chunk.text:
                    yield chunk.text
