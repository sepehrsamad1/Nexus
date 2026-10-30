import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <section className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        <SearchX className="mx-auto h-12 w-12 text-indigo-400" aria-hidden="true" />
        <p className="mt-5 text-xs font-black uppercase tracking-widest text-zinc-500">Nexus</p>
        <h1 className="mt-2 text-3xl font-black text-white">Page not found</h1>
        <p className="mt-3 text-zinc-400">The page or item you requested could not be found.</p>
        <Link href="/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition-colors hover:bg-indigo-500">Back to home <ArrowLeft className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}
