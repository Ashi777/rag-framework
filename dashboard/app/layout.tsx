import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAG Framework',
  description: 'Production RAG with hybrid search, cross-encoder reranking, and cited answers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <header className="bg-gray-900 text-white shadow-md">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight">RAG Framework</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">v1.0</span>
            </div>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                Ask
              </Link>
              <Link href="/stream" className="text-gray-300 hover:text-white transition-colors">
                Stream
              </Link>
              <Link href="/ask-image" className="text-gray-300 hover:text-white transition-colors">
                Ask Image
              </Link>
              <Link href="/upload" className="text-gray-300 hover:text-white transition-colors">
                Upload
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="text-center text-xs text-gray-400 py-8">
          Hybrid BM25 + Vector · Cross-Encoder Reranking · LLM-as-Judge Evaluation
        </footer>
      </body>
    </html>
  )
}
