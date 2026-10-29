'use client';

export default function GamesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="max-w-3xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-black text-white">Games discovery hit a problem</h1><p className="text-zinc-500 mt-2">The catalog could not be loaded. Try again without losing your filters.</p><button onClick={() => reset()} className="mt-6 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500">Try again</button></main>;
}
