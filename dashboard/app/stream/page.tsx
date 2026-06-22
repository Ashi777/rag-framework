import StreamingQueryForm from '@/components/StreamingQueryForm'

export default function StreamPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Streaming answers</h2>
        <p className="text-gray-500 text-sm">
          Same hybrid retrieval pipeline as Ask &nbsp;&middot;&nbsp; tokens stream via SSE &nbsp;&middot;&nbsp; citations appear after
        </p>
      </div>

      {/* How it works */}
      <div className="mb-8 bg-purple-50 rounded-xl border border-purple-100 p-5 text-sm text-purple-800">
        <p className="font-semibold mb-1">How it works</p>
        <ol className="list-decimal list-inside space-y-1 text-purple-700">
          <li>Hybrid BM25 + vector search retrieves the top candidates</li>
          <li>Cross-encoder reranker selects the most relevant chunks</li>
          <li>Gemini streams the answer token-by-token over Server-Sent Events</li>
          <li>Citation metadata arrives in a final event once generation completes</li>
        </ol>
      </div>

      <StreamingQueryForm />
    </div>
  )
}
