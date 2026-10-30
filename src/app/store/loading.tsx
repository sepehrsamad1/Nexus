export default function StoreLoading() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen" aria-busy="true" aria-label="Loading store">
      <div className="h-64 rounded-3xl bg-zinc-900 animate-pulse" />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[31rem] rounded-2xl bg-zinc-900 animate-pulse" />
        ))}
      </div>
    </main>
  );
}
