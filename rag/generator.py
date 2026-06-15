"""LLM generation with pluggable free providers.

Supported providers (set LLM_PROVIDER in .env):
  gemini  — Google Gemini via google-genai (default). Needs GEMINI_API_KEY.
  groq    — Groq cloud via groq SDK. Needs GROQ_API_KEY. 14,400 req/day free.

Both are free tier, no credit card required.
"""
import os
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
