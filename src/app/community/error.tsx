'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 min-h-screen">
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
        <h1 className="text-2xl font-black text-white">Community is temporarily unavailable</h1>
        <p className="mt-2 text-sm text-zinc-400">We could not load the discussion feed. No community content was changed.</p>
        <button onClick={reset} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500">Try again</button>
      </div>
    </main>
  );
}
