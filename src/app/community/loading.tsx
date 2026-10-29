export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="animate-pulse">
        <div className="h-3 w-32 rounded bg-zinc-800" />
        <div className="mt-4 h-10 w-72 rounded bg-zinc-800" />
        <div className="mt-3 h-5 w-full max-w-2xl rounded bg-zinc-900" />
        <div className="mt-8 space-y-4">
          {[1,2,3].map(item => <div key={item} className="h-32 rounded-2xl border border-zinc-800 bg-zinc-900" />)}
        </div>
      </div>
    </main>
  );
}
