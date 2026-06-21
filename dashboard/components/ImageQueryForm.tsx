'use client'

import { useRef, useState } from 'react'
import { askImage, type AskResponse } from '@/lib/api'
import AnswerCard from './AnswerCard'

const ACCEPTED = '.png,.jpg,.jpeg,.gif,.webp'

export default function ImageQueryForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AskResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function pickFile(f: File) {
    setFile(f)
    setResult(null)
    setError(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await askImage(file, query || undefined)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`cursor-pointer rounded-xl border-2 border-dashed transition-colors
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}
          flex flex-col items-center justify-center gap-3 p-10 text-center`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 max-w-full rounded-lg object-contain shadow"
          />
        ) : (
          <>
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            <p className="text-sm text-gray-500">
              Drag & drop an image or <span className="text-blue-600 font-medium">click to browse</span>
            </p>
            <p className="text-xs text-gray-400">PNG, JPEG, GIF, WebP</p>
          </>
        )}
      </div>

      {file && (
        <p className="text-xs text-gray-500 -mt-3">
          {file.name} &nbsp;·&nbsp; {(file.size / 1024).toFixed(1)} KB
          <button
            type="button"
            onClick={() => { setFile(null); setPreview(null); setResult(null) }}
            className="ml-3 text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </p>
      )}

      {/* Question input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. What does this chart show? What text is visible?"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
          disabled={loading}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm
          hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Analyzing with Gemini Vision…
          </span>
        ) : 'Analyze Image'}
      </button>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {/* Result */}
      {result && <AnswerCard result={result} />}
    </form>
  )
}
