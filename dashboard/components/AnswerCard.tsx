import type { AskResponse } from '@/lib/api'

interface Props {
  result: AskResponse
}

export default function AnswerCard({ result }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Answer */}
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Answer
        </p>
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
      </div>

      {/* Citations */}
      {result.cited_sources.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Sources cited
          </p>
          <ul className="space-y-2">
            {result.cited_sources.map((src, i) => (
              <li key={src} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <span className="font-mono text-xs">{src}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.cited_sources.length === 0 && (
        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          No inline citations detected in this answer.
        </div>
      )}
    </div>
  )
}
