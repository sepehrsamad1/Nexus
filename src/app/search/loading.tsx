export default function SearchLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen" aria-busy="true" aria-label="Loading search">
      <div className="h-10 w-56 rounded-lg bg-zinc-900 animate-pulse" />
      <div className="mt-8 h-14 w-full rounded-xl bg-zinc-900 animate-pulse" />
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-64 rounded-2xl bg-zinc-900 animate-pulse" />)}
      </div>
    </main>
  );
}
