'use client'

import { useRef, useState } from 'react'
import { streamAsk } from '@/lib/api'

interface Citation {
  source: string
  text: string
}

export default function StreamingQueryForm() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [citedSources, setCitedSources] = useState<string[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [streaming, setStreaming] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<(() => void) | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q || streaming) return

    // Reset state
    setAnswer('')
    setCitedSources([])
    setCitations([])
    setError(null)
    setDone(false)
    setStreaming(true)

    let cancelled = false
    abortRef.current = () => { cancelled = true }

    try {
      for await (const event of streamAsk(q)) {
        if (cancelled) break
        if (event.type === 'token') {
          setAnswer(prev => prev + event.text)
        } else if (event.type === 'citations') {
          setCitedSources(event.cited_sources)
          setCitations(event.citations as Citation[])
        } else if (event.type === 'error') {
          setError(event.message)
        } else if (event.type === 'done') {
          break
        }
      }
    } catch (err: unknown) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Stream failed')
      }
    } finally {
      setStreaming(false)
      setDone(true)
      abortRef.current = null
    }
  }

  function handleStop() {
    abortRef.current?.()
  }

  return (
    <div>
      {/* Query form */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Explain retrieval augmented generation"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 shadow-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
          disabled={streaming}
        />
        {streaming ? (
          <button
            type="button"
            onClick={handleStop}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 transition-colors"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!query.trim()}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Stream
          </button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {/* Streaming answer */}
      {(answer || streaming) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Answer
              </p>
              {streaming && (
                <span className="flex items-center gap-1 text-xs text-purple-500 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                  </span>
                  streaming
                </span>
              )}
            </div>
            <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
              {answer}
              {streaming && (
                <span className="inline-block w-0.5 h-4 bg-gray-700 ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>

          {/* Citations — only shown once streaming is complete */}
          {done && citedSources.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                Sources cited
              </p>
              <ul className="space-y-2">
                {citedSources.map((src, i) => (
                  <li key={src} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-semibold">
                      {i + 1}
                    </span>
                    <span className="font-mono text-xs">{src}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {done && citedSources.length === 0 && (
            <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
              No inline citations detected in this answer.
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!answer && !streaming && !error && (
        <div className="text-center py-16 text-gray-300 select-none">
          <p className="text-4xl mb-3">⚡</p>
          <p className="text-sm">Tokens appear instantly as the model generates them</p>
          <p className="text-xs mt-1">
            No waiting — the answer streams token-by-token
          </p>
        </div>
      )}
    </div>
  )
}
