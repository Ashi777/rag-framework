'use client'

import { useState } from 'react'
import { ask, type AskResponse } from '@/lib/api'
import AnswerCard from '@/components/AnswerCard'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await ask(q)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Ask your documents</h2>
        <p className="text-gray-500 text-sm">
          Hybrid BM25 + vector search &nbsp;&middot;&nbsp; Cross-encoder reranking &nbsp;&middot;&nbsp; Inline citations
        </p>
      </div>

      {/* Query form */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What is Python used for?"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Thinking…
            </span>
          ) : (
            'Ask'
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="font-semibold">Error:</span> {error}
          {error.toLowerCase().includes('503') || error.toLowerCase().includes('unavailable') ? (
            <p className="mt-1 text-red-500 text-xs">
              Make sure the API server and Qdrant are running.
            </p>
          ) : null}
        </div>
      )}

      {/* Answer */}
      {result && <AnswerCard result={result} />}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="text-center py-16 text-gray-300 select-none">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">Ask a question to get started</p>
          <p className="text-xs mt-1">
            Upload documents first via the{' '}
            <a href="/upload" className="text-blue-400 hover:underline">
              Upload
            </a>{' '}
            page
          </p>
        </div>
      )}
    </div>
  )
}
