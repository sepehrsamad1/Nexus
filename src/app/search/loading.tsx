export default function SearchLoading() {
  return <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><div className="h-10 w-64 bg-zinc-900 rounded-lg animate-pulse mb-8" /><div className="h-14 bg-zinc-900 rounded-xl animate-pulse mb-10" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-56 rounded-2xl bg-zinc-900 animate-pulse" />)}</div></main>;
}
