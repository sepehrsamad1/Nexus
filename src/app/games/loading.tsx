export default function GamesLoading() {
  return <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><div className="h-10 w-72 bg-zinc-900 rounded-lg animate-pulse mb-8" /><div className="h-28 bg-zinc-900 rounded-2xl animate-pulse mb-10" /><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 rounded-2xl bg-zinc-900 animate-pulse" />)}</div></main>;
}
