'use client';

import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWishlist } from '@/store/useWishlist';

export function ProfileSavedSummary() {
  const items = useWishlist(state => state.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"><h2 className="font-black text-white">Saved & Wishlist</h2><p className="mt-2 text-sm text-zinc-500">Loading your saved items…</p></section>;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="font-black text-white">Saved & Wishlist</h2><p className="mt-1 text-sm text-zinc-500">{items.length ? items.length + ' item' + (items.length === 1 ? '' : 's') + ' saved on this device.' : 'Nothing saved yet.'}</p></div>
        <Heart className="h-5 w-5 text-rose-400" />
      </div>
      {items.length ? <div className="mt-4 flex gap-3 overflow-x-auto pb-1">{items.slice(0, 4).map(item => <Link key={item.type + ':' + item.id} href={item.href} className="min-w-40 rounded-xl border border-zinc-800 bg-zinc-950 p-3 hover:border-indigo-500/50"><img src={item.image} alt="" className="h-20 w-full rounded-lg object-contain" /><p className="mt-2 line-clamp-2 text-sm font-bold text-white">{item.name}</p></Link>)}</div> : null}
      <Link href="/wishlist" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-indigo-400 hover:text-indigo-300">Open wishlist <ArrowRight className="h-4 w-4" /></Link>
    </section>
  );
}
