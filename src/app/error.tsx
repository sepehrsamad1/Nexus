'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalErrorState({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <section role="alert" className="w-full max-w-lg rounded-3xl border border-rose-500/20 bg-zinc-900 p-8 text-center shadow-2xl">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-400" aria-hidden="true" />
        <p className="mt-5 text-xs font-black uppercase tracking-widest text-rose-300">Something went wrong</p>
        <h1 className="mt-2 text-3xl font-black text-white">Nexus could not load this page</h1>
        <p className="mt-3 text-zinc-400">Try again, or return to the home page if the problem continues.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition-colors hover:bg-indigo-500">
            Try again <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
          <Link href="/" className="inline-flex items-center rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-200 transition-colors hover:bg-zinc-800">Home</Link>
        </div>
      </section>
    </main>
  );
}
