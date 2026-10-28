import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { safeJsonParse } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      recommendedByStreamer: true,
      relatedGame: true
    }
  });

  if (!product) notFound();
  
  const specs = safeJsonParse<Record<string, string>>(product.specsJson, {});

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <Link href="/store" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center p-12">
           <div className="w-64 h-64 bg-zinc-800 rounded-full shadow-2xl flex items-center justify-center">
             <span className="text-zinc-600 font-bold">Product Image</span>
           </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <div className="text-indigo-400 font-bold tracking-wider uppercase text-sm mb-2">{product.brand}</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{product.name}</h1>
          <p className="text-lg text-zinc-400 mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-mono font-bold text-white">${product.price.toFixed(2)}</span>
            <div className="flex items-center gap-1 text-sm font-medium px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> In Stock ({product.stock} left)
            </div>
          </div>

          <AddToCartButton 
            id={product.id}
            name={product.name}
            price={product.price}
            image="https://via.placeholder.com/150/18181b/ffffff?text=GEAR"
            type="PHYSICAL_GEAR"
            category={product.category}
            className="w-full sm:w-auto px-12 py-4 text-lg rounded-xl mb-10 shadow-lg shadow-indigo-500/25"
          />

          {/* Streamer Endorsement */}
          {product.recommendedByStreamer && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8 flex items-center gap-4">
               <img src={product.recommendedByStreamer.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.recommendedByStreamer.id}`} alt="Streamer" className="w-12 h-12 rounded-full" />
               <div>
                 <div className="text-sm font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Streamer Choice</div>
                 <div className="text-zinc-300 text-sm">Used by <strong>{product.recommendedByStreamer.name}</strong></div>
               </div>
            </div>
          )}

          {/* Specs Table */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm text-zinc-500">{key}</span>
                  <span className="font-medium text-zinc-200">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
