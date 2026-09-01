import React from 'react'
import Link from 'next/link'
import { Scissors, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400">
          <Scissors className="w-8 h-8 rotate-90" />
        </div>

        <div className="space-y-2">
          <span className="text-amber-400 font-mono text-sm tracking-wider uppercase">404 Error</span>
          <h1 className="text-3xl font-bold text-white font-poppins">Page Not Found</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {"Looks like this cut went off the lines. The page you are looking for doesn't exist or has been moved."}
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Book Haircut
          </Link>
        </div>
      </div>
    </div>
  )
}
