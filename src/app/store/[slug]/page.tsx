import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { MediaImage } from '@/components/MediaImage';
import { safeJsonParse } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, ShieldCheck, Star, ExternalLink, Package } from 'lucide-react';
import Link from 'next/link';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { recommendedByStreamer: true, relatedGame: true },
  });

  if (!product) notFound();

  const specs = safeJsonParse<Record<string, string>>(product.specsJson, {});
  const gallery = safeJsonParse<string[]>(product.imagesJson, []);
  const imageSources = safeJsonParse<string[]>(product.imageSourceJson, []);
  const inStock = product.stock > 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <Link href="/store" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-14">
        <section>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <MediaImage src={gallery[0] ?? null} alt={product.name} fallbackLabel={product.name} />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-2 gap-4 mt-4" aria-label="Product image gallery">
              {gallery.slice(1).map((image, index) => (
                <div key={image} className="aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  <MediaImage src={image} alt={`${product.name} alternate view ${index + 2}`} />
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-zinc-600 mt-3">
            Nexus catalog artwork is used for the prototype presentation. The source link below identifies the manufacturer/product reference.
          </p>
        </section>

        <section className="flex flex-col">
          <div className="text-indigo-400 font-black tracking-wider uppercase text-xs">{product.brand} · {product.category.replaceAll('_', ' ')}</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-2">{product.name}</h1>
          <p className="text-lg leading-8 text-zinc-400 mt-5">{product.description}</p>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <span className="text-4xl font-black text-white">${product.price.toFixed(2)}</span>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${inStock ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border border-red-500/20 text-red-300'}`}>
              {inStock ? <CheckCircle2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-5">
            {product.rating > 0 ? (
              <>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="font-black text-white">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-zinc-500">market rating · {product.reviewCount.toLocaleString()} reviews</span>
              </>
            ) : (
              <span className="text-sm text-zinc-500">Market rating/review count was not available in the retrieved current-source data.</span>
            )}
          </div>

          <div className="mt-7">
            <AddToCartButton
              id={product.id}
              name={product.name}
              price={product.price}
              image={gallery[0] ?? ''}
              type="PHYSICAL_GEAR"
              category={product.category}
              className="w-full px-8 py-4 text-lg rounded-xl shadow-lg shadow-indigo-500/20"
            />
          </div>

          {product.relatedGame && (
            <Link href={`/games/${product.relatedGame.slug}`} className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-indigo-500/40 transition-colors">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Related game</div>
              <div className="text-white font-bold mt-1">{product.relatedGame.title}</div>
            </Link>
          )}

          {product.recommendedByStreamer && (
            <div className="mt-5 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
              <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <div className="text-xs font-black text-purple-400 uppercase tracking-wide">Demo creator recommendation</div>
                <div className="text-sm text-zinc-300 mt-1">Seeded recommendation by <strong>{product.recommendedByStreamer.name}</strong>; not a verified endorsement.</div>
              </div>
            </div>
          )}

          <div className="mt-9">
            <h2 className="text-xl font-black text-white border-b border-zinc-800 pb-3">Technical specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                  <div className="text-xs text-zinc-500">{key}</div>
                  <div className="font-bold text-zinc-100 mt-1">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-zinc-500">Price reference</div>
                <div className="text-sm text-zinc-300 mt-1">{product.priceSource ?? 'Prototype seed price'}</div>
              </div>
              {product.sourceUrl && (
                <a href={product.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300 hover:text-indigo-200">
                  Manufacturer reference <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {imageSources[0] && <div className="text-[11px] text-zinc-600 mt-3">Product media reference: {imageSources[0]}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
