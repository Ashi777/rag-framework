'use client'

import { useState } from 'react'
import { uploadDocument, type UploadResponse } from '@/lib/api'

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await uploadDocument(file)
      setResult(data)
      setFile(null)
      // Reset the file input
      const input = document.getElementById('file-input') as HTMLInputElement
      if (input) input.value = ''
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Drop zone */}
      <label
        htmlFor="file-input"
        className={`block w-full rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
          file
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-blue-300 bg-white'
        }`}
      >
        {file ? (
          <div>
            <p className="text-lg font-semibold text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <p className="text-xs text-blue-600 mt-2">Click to change</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 font-medium">Click to select a document</p>
            <p className="text-sm text-gray-400 mt-1">PDF · TXT · Markdown · HTML</p>
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept=".pdf,.txt,.md,.html,.htm"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Uploading & ingesting...' : 'Upload & Ingest'}
      </button>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {result && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
          <p className="font-semibold">{result.message}</p>
          <p className="mt-1 text-green-700">
            {result.chunks_stored} chunks stored from &ldquo;{result.filename}&rdquo;
          </p>
        </div>
      )}
    </form>
  )
}
