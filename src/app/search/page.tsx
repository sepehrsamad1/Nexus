import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Search, Gamepad2, ShoppingBag } from 'lucide-react';
import { MediaImage } from '@/components/MediaImage';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { productMatchesQuery, gameMatchesQuery } from '@/lib/discovery';
import { safeJsonParse } from '@/lib/utils';

export default async function GlobalSearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; type?: string }> }) {
  const params = (await searchParams) ?? {};
  const query = typeof params.q === 'string' ? params.q.trim() : '';
  const type = params.type === 'games' || params.type === 'gear' ? params.type : 'all';
  const [allGames, allProducts] = await Promise.all([
    prisma.game.findMany({ orderBy: { expertScore: 'desc' } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  const games = type === 'gear' ? [] : allGames.filter(game => gameMatchesQuery(game, query));
  const products = type === 'games' ? [] : allProducts.filter(product => productMatchesQuery(product, query));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-4xl font-black text-white">Global Search</h1>
        <p className="text-zinc-400 mt-2">Search Nexus games and gaming gear from one place.</p>
      </div>

      <form method="get" className="flex flex-col sm:flex-row gap-3 mb-8">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input autoFocus name="q" defaultValue={query} placeholder="Try Dota 2, Souls, mouse, keyboard..." aria-label="Search Nexus" className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500" />
        </label>
        <select name="type" defaultValue={type} aria-label="Search type" className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white">
          <option value="all">Games + Gear</option>
          <option value="games">Games only</option>
          <option value="gear">Gear only</option>
        </select>
        <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500">Search</button>
      </form>

      {!query ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center text-zinc-500">Start typing a game title, genre, platform, brand, or gear category.</div>
      ) : games.length === 0 && products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
          <Search className="w-10 h-10 mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-white">No Nexus results for “{query}”</h2>
          <p className="text-zinc-500 mt-2">Try a broader title, genre, platform, brand, or product category.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {games.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-black text-white flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-emerald-400" /> Games</h2><span className="text-xs text-zinc-500">{games.length} result{games.length === 1 ? '' : 's'}</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {games.map(game => <Link key={game.id} href={`/games/${game.slug}`} className="group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-indigo-500/50 transition-colors">
                  <div className="h-40 relative"><MediaImage src={game.coverImage} alt={`${game.title} cover art`} fallbackLabel="Game artwork unavailable" /><div className="absolute bottom-3 left-3"><MetascoreBadge score={game.expertScore} size="sm" /></div></div>
                  <div className="p-4"><h3 className="font-bold text-white group-hover:text-indigo-400">{game.title}</h3><p className="text-xs text-zinc-500 mt-1">{safeJsonParse<string[]>(game.genresJson, []).slice(0, 2).join(' · ')}</p></div>
                </Link>)}
              </div>
            </section>
          )}
          {products.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-black text-white flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-indigo-400" /> Gear</h2><span className="text-xs text-zinc-500">{products.length} result{products.length === 1 ? '' : 's'}</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map(product => { const image = safeJsonParse<string[]>(product.imagesJson, [])[0] || '/media-fallback.svg'; return <Link key={product.id} href={`/store/${product.slug}`} className="group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-indigo-500/50 transition-colors">
                  <div className="h-40 relative"><MediaImage src={image} alt={`${product.name} product image`} fallbackLabel="Product image unavailable" /></div>
                  <div className="p-4"><div className="text-[10px] uppercase font-black text-indigo-400">{product.category}</div><h3 className="font-bold text-white group-hover:text-indigo-400 mt-1">{product.name}</h3><p className="text-xs text-zinc-500 mt-1">{product.brand} · ${product.price.toFixed(2)}</p></div>
                </Link>; })}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
