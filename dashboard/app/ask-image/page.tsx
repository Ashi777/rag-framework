import ImageQueryForm from '@/components/ImageQueryForm'

export default function AskImagePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Ask about an image</h2>
        <p className="text-gray-500 text-sm">
          Upload a chart, diagram, screenshot, or photo.
          <br />
          Gemini 2.0 Flash Vision analyzes it and cross-references your knowledge base.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <ImageQueryForm />
      </div>

      <div className="mt-8 bg-purple-50 rounded-xl border border-purple-100 p-5 text-sm text-purple-800">
        <p className="font-semibold mb-1">How multi-modal RAG works</p>
        <ol className="list-decimal list-inside space-y-1 text-purple-700">
          <li>Your image is sent to Gemini 2.0 Flash Vision</li>
          <li>Your question retrieves relevant text chunks from Qdrant</li>
          <li>Gemini answers using both the image pixels and the retrieved context</li>
          <li>The answer is grounded in your documents and what it sees</li>
        </ol>
        <p className="mt-3 text-xs text-purple-500">
          You can also <a href="/upload" className="underline">upload images as documents</a> — Gemini describes them so they become searchable via text.
        </p>
      </div>
    </div>
  )
}
