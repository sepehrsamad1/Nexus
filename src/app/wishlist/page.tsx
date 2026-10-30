'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/store/useWishlist';
import { useCart } from '@/store/useCart';
import { MediaImage } from '@/components/MediaImage';
import { useEffect, useState } from 'react';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const addItem = useCart(state => state.addItem);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-screen" aria-busy="true" aria-label="Loading wishlist"><div className="h-10 w-48 rounded-lg bg-zinc-900 animate-pulse" /><div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(item => <div key={item} className="h-80 rounded-2xl bg-zinc-900 animate-pulse" />)}</div></main>;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-rose-300 text-xs font-black uppercase tracking-widest">Saved for later</p>
          <h1 className="text-4xl font-black text-white mt-1">Wishlist</h1>
        </div>
        <div className="flex items-center gap-4"><Link href="/games" className="text-sm font-bold text-indigo-300 hover:text-indigo-200">Browse games</Link><Link href="/store" className="text-sm font-bold text-indigo-300 hover:text-indigo-200">Browse store</Link></div>
      </div>

      {items.length === 0 ? (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 py-20 px-6 text-center">
          <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-5" />
          <h2 className="text-2xl font-black text-white">Nothing saved yet</h2>
          <p className="text-zinc-500 mt-2 max-w-md mx-auto">Tap the heart on a game or product to save it here. Your wishlist persists across refreshes on this device.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-7"><Link href="/games" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Find games <ArrowRight className="w-4 h-4" /></Link><Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-bold">Find gear <ArrowRight className="w-4 h-4" /></Link></div>
        </section>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <article key={item.type + ':' + item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden">
              <Link href={item.href} className="block h-52 bg-zinc-950">
                <MediaImage src={item.image} alt={item.name} fallbackLabel="Image unavailable" className="object-contain p-6" />
              </Link>
              <div className="p-5">
                <Link href={item.href} className="font-black text-lg text-white hover:text-indigo-300 line-clamp-2">{item.name}</Link>
                <div className="flex items-center justify-between gap-3 mt-5">
                  <span className="font-black text-white">{'$' + item.price.toFixed(2)}</span>
                  <div className="flex gap-2">
                    {item.type === "GAME" ? <Link href={item.href} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold">View game</Link> : <button onClick={() => {
                      if (item.type === 'GAME') return;
                      addItem({ id: item.id, name: item.name, price: item.price, image: item.image, type: item.type, category: item.category });
                    }} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold"><ShoppingCart className="w-4 h-4" /> Cart</button>}
                    <button aria-label={'Remove ' + item.name + ' from wishlist'} onClick={() => removeItem(item.id, item.type)} className="p-2 rounded-lg border border-zinc-700 text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
