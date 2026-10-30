import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingBag, Key, Package, ArrowRight, Star, Boxes } from 'lucide-react';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { MediaImage } from '@/components/MediaImage';
import { safeJsonParse } from '@/lib/utils';

function Rating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return rating > 0 ? (
    <div className="flex items-center gap-1 text-sm">
      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
      <span className="font-bold text-white">{rating.toFixed(1)}</span>
      <span className="text-zinc-500">({reviewCount.toLocaleString()})</span>
    </div>
  ) : (
    <span className="text-xs text-zinc-500">No market rating available</span>
  );
}

export default async function StorefrontPage() {
  const products = await prisma.product.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] });
  const games = await prisma.game.findMany({ where: { digitalPrice: { gt: 0 } }, orderBy: { title: 'asc' } });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-indigo-950/30 p-7 sm:p-10 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest mb-4">
              <ShoppingBag className="w-4 h-4" /> Nexus Store
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">Curated gear. Zero filler.</h1>
            <p className="text-zinc-400 mt-3 max-w-2xl text-base sm:text-lg">
              Fifteen hand-picked gaming products spanning competitive peripherals, creator gear, displays, storage, GPUs and console hardware.
            </p>
          </div>
          <Link href="/checkout" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">
            View cart <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="mb-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">P11 curated catalog</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Gaming gear</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <Boxes className="w-4 h-4" /> {products.length} products
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map(product => {
            const specs = safeJsonParse<Record<string, string>>(product.specsJson, {});
            const images = safeJsonParse<string[]>(product.imagesJson, []);
            const image = images[0] ?? null;
            const inStock = product.stock > 0;

            return (
              <article key={product.id} className="group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                <Link href={`/store/${product.slug}`} className="block">
                  <div className="h-64 relative bg-zinc-950 overflow-hidden">
                    <MediaImage src={image} alt={product.name} fallbackLabel={product.name} className="transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                    <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-zinc-950/85 border border-zinc-700 text-[10px] text-zinc-300 font-black uppercase tracking-wider">
                      {product.category.replaceAll('_', ' ')}
                    </span>
                    <span className={`absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${inStock ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                      {inStock ? 'In stock' : 'Out of stock'}
                    </span>
                  </div>
                </Link>

                <div className="p-5">
                  <div className="text-xs font-black text-indigo-400 uppercase tracking-wider">{product.brand}</div>
                  <Link href={`/store/${product.slug}`} className="block mt-1">
                    <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-zinc-500 mt-2 line-clamp-2 min-h-10">{product.description}</p>

                  <div className="flex items-center justify-between gap-3 mt-4">
                    <Rating rating={product.rating} reviewCount={product.reviewCount} />
                    <span className="text-xs text-zinc-500">{product.stock} units</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-4 min-h-7">
                    {Object.entries(specs).slice(0, 3).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-medium">{value}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-zinc-800">
                    <span className="text-2xl font-black text-white">${product.price.toFixed(2)}</span>
                    <div className="min-w-36">
                      <AddToCartButton id={product.id} name={product.name} price={product.price} image={image ?? ''} type="PHYSICAL_GEAR" category={product.category} fullWidth />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest">Digital catalog</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Game keys</h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 text-xs text-zinc-500"><Key className="w-4 h-4" /> Simulated delivery</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {games.map(game => (
            <div key={game.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="h-40 relative bg-zinc-950">
                <MediaImage src={game.coverImage} alt={`${game.title} cover art`} fallbackLabel="Game artwork unavailable" />
                <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase">Digital key</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white line-clamp-1">{game.title}</h3>
                <div className="flex items-center justify-between gap-3 mt-4">
                  <span className="font-black text-white">${game.digitalPrice.toFixed(2)}</span>
                  <AddToCartButton id={game.id} name={`${game.title} (Digital Key)`} price={game.digitalPrice} image={game.coverImage} type="DIGITAL_KEY" category="GAME_KEY" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
