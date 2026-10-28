import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingBag, Key, Package, Filter } from 'lucide-react';
import { AddToCartButton } from '@/components/store/AddToCartButton';
import { safeJsonParse } from '@/lib/utils';

export default async function StorefrontPage() {
  // Fetch Hardware
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Fetch Games to sell digital keys
  const games = await prisma.game.findMany({
    where: { digitalPrice: { gt: 0 } },
    orderBy: { title: 'asc' }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-400" /> Nexus Gear & Keys
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Official storefront for pro equipment and instant digital game keys.</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold whitespace-nowrap">All Items</button>
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2">
            <Key className="w-4 h-4" /> Digital Keys
          </button>
          <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2">
            <Package className="w-4 h-4" /> Physical Gear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Filter className="w-4 h-4" /> Categories</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <label className="flex items-center gap-2 hover:text-white cursor-pointer"><input type="checkbox" className="rounded bg-zinc-950 border-zinc-800 text-indigo-500" /> Digital Games</label>
              <label className="flex items-center gap-2 hover:text-white cursor-pointer"><input type="checkbox" className="rounded bg-zinc-950 border-zinc-800 text-indigo-500" /> Mice</label>
              <label className="flex items-center gap-2 hover:text-white cursor-pointer"><input type="checkbox" className="rounded bg-zinc-950 border-zinc-800 text-indigo-500" /> Keyboards</label>
              <label className="flex items-center gap-2 hover:text-white cursor-pointer"><input type="checkbox" className="rounded bg-zinc-950 border-zinc-800 text-indigo-500" /> Headsets</label>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {/* Render Games as Digital Products */}
            {games.map(game => (
              <div key={game.id} className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-colors flex flex-col">
                <div className="h-48 relative overflow-hidden bg-zinc-950 p-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.coverImage} className="max-h-full object-cover rounded shadow-lg group-hover:scale-105 transition-transform" alt={game.title} />
                  <div className="absolute top-3 right-3 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black rounded uppercase">Digital Key</div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{game.title}</h3>
                  <p className="text-zinc-500 text-xs mb-4">Instant Steam/Activation Key</p>
                  
                  <div className="mt-auto pt-4 border-t border-zinc-800">
                    <AddToCartButton 
                      id={game.id} 
                      name={`${game.title} (Digital Key)`} 
                      price={game.digitalPrice} 
                      image={game.coverImage} 
                      type="DIGITAL_KEY"
                      category="GAME_KEY"
                      fullWidth
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Render Hardware Products */}
            {products.map(product => {
              const specs = safeJsonParse<Record<string,string>>(product.specsJson, {});
              return (
                <Link key={product.id} href={`/store/${product.slug}`} className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-colors flex flex-col">
                  <div className="h-48 relative bg-zinc-950 flex items-center justify-center p-6">
                    {/* Placeholder for real hardware images */}
                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center shadow-2xl">
                      <Package className="w-10 h-10 text-zinc-600" />
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black rounded uppercase">Physical Gear</div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-xs text-indigo-400 font-bold mb-1 uppercase">{product.brand}</div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">{product.name}</h3>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {Object.values(specs).slice(0, 2).map((val, idx) => (
                         <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">{val}</span>
                      ))}
                    </div>
                    
                    {/* Removed the inline onClick handler here that was causing the Server Component error */}
                    <div className="mt-auto pt-4 border-t border-zinc-800 relative z-10">
                      <AddToCartButton 
                        id={product.id} 
                        name={product.name} 
                        price={product.price} 
                        image="https://via.placeholder.com/150/18181b/ffffff?text=GEAR" 
                        type="PHYSICAL_GEAR"
                        category={product.category}
                        fullWidth
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
