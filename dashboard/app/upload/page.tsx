import UploadForm from '@/components/UploadForm'

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload a document</h2>
        <p className="text-gray-500 text-sm">
          PDF, TXT, Markdown, and HTML files are supported.
          <br />
          Each file is chunked, embedded, and stored in Qdrant automatically.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <UploadForm />
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl border border-blue-100 p-5 text-sm text-blue-800">
        <p className="font-semibold mb-1">What happens after upload?</p>
        <ol className="list-decimal list-inside space-y-1 text-blue-700">
          <li>The document is split into overlapping chunks (~512 tokens each)</li>
          <li>Each chunk is embedded with <code className="font-mono text-xs">all-MiniLM-L6-v2</code></li>
          <li>Chunks are stored in the Qdrant vector database</li>
          <li>Future searches will include this document automatically</li>
        </ol>
      </div>
    </div>
  )
}
