const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  rank: number
  text: string
  source: string
  score: number
}

export interface AskResponse {
  query: string
  answer: string
  citations: Array<{ text: string; source: string; chunk_index: number }>
  cited_sources: string[]
}

export interface UploadResponse {
  filename: string
  chunks_stored: number
  message: string
}

export interface StatsResponse {
  collection: string
  total_chunks: number
  embedding_model: string
  qdrant_url: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((err as { detail?: string }).detail ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function ask(query: string, topK = 5): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  })
  return handleResponse<AskResponse>(res)
}

export async function search(query: string, topK = 5): Promise<SearchResult[]> {
  const res = await fetch(`${API_URL}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  })
  return handleResponse<SearchResult[]>(res)
}

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: form })
  return handleResponse<UploadResponse>(res)
}

export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_URL}/stats`)
  return handleResponse<StatsResponse>(res)
}

// ---------------------------------------------------------------------------
// Streaming types
// ---------------------------------------------------------------------------

export type StreamEvent =
  | { type: 'token';     text: string }
  | { type: 'citations'; citations: AskResponse['citations']; cited_sources: string[] }
  | { type: 'error';     message: string }
  | { type: 'done' }

/**
 * POST /stream — yields SSE events as they arrive from the server.
 *
 * Usage:
 *   for await (const event of streamAsk('What is RAG?')) {
 *     if (event.type === 'token') appendText(event.text)
 *   }
 */
export async function* streamAsk(
  query: string,
  topK = 5,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${API_URL}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error((err as { detail?: string }).detail ?? 'Stream request failed')
  }

  if (!res.body) throw new Error('No response body from /stream')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    // SSE events are delimited by double newline
    const parts = buffer.split('\n\n')
    buffer = parts.pop() ?? ''

    for (const part of parts) {
      for (const line of part.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const payload = line.slice(6).trim()
        if (payload === '[DONE]') {
          yield { type: 'done' }
          return
        }
        try {
          yield JSON.parse(payload) as StreamEvent
        } catch {
          // malformed event — skip
        }
      }
    }
  }
}

export async function askImage(
  file: File,
  query = 'Describe what you see in this image.',
  topK = 5,
): Promise<AskResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('query', query)
  form.append('top_k', String(topK))
  const res = await fetch(`${API_URL}/ask-image`, { method: 'POST', body: form })
  return handleResponse<AskResponse>(res)
}
