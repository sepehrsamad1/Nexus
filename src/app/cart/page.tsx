'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight, Package, Key } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="flex items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Nexus Store</p>
          <h1 className="text-4xl font-black text-white mt-1">Your cart</h1>
        </div>
        <Link href="/store" className="text-sm font-bold text-indigo-300 hover:text-indigo-200">Continue shopping</Link>
      </div>

      {items.length === 0 ? (
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/60 py-20 px-6 text-center">
          <ShoppingCart className="w-16 h-16 text-zinc-700 mx-auto mb-5" />
          <h2 className="text-2xl font-black text-white">Your cart is empty</h2>
          <p className="text-zinc-500 mt-2 max-w-md mx-auto">Add gaming gear or digital keys from the store and they will stay here when you refresh the page.</p>
          <Link href="/store" className="inline-flex mt-7 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">Browse the store</Link>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <section className="space-y-4">
            {items.map(item => (
              <article key={item.type + ':' + item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 flex gap-4">
                <img src={item.image} alt="" className="w-24 h-24 sm:w-32 sm:h-24 rounded-xl object-contain bg-zinc-950 p-2" />
                <div className="min-w-0 flex-1">
                  <Link href={item.type === 'PHYSICAL_GEAR' ? '/store/' + item.id : '/store'} className="font-black text-white hover:text-indigo-300 line-clamp-2">{item.name}</Link>
                  <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    {item.type === 'DIGITAL_KEY' ? <Key className="w-3 h-3 text-emerald-400" /> : <Package className="w-3 h-3 text-amber-400" />}
                    {item.type === 'DIGITAL_KEY' ? 'Digital key' : 'Physical gear'}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                    <span className="font-black text-indigo-300">{'$' + (item.price * item.quantity).toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-950 p-1">
                        <button aria-label={'Decrease quantity for ' + item.name} disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1, item.type)} className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30"><Minus className="w-4 h-4" /></button>
                        <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                        <button aria-label={'Increase quantity for ' + item.name} onClick={() => updateQuantity(item.id, item.quantity + 1, item.type)} className="p-1.5 text-zinc-400 hover:text-white"><Plus className="w-4 h-4" /></button>
                      </div>
                      <button aria-label={'Remove ' + item.name + ' from cart'} onClick={() => removeItem(item.id, item.type)} className="p-2 text-rose-400 hover:text-rose-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-black text-white">Order summary</h2>
            <div className="flex justify-between mt-6 text-zinc-400"><span>Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="flex justify-between mt-3 text-white text-2xl font-black"><span>Total</span><span>{'$' + getTotal().toFixed(2)}</span></div>
            <p className="text-xs text-zinc-600 mt-3">Final stock and prices are revalidated on checkout.</p>
            <Link href="/checkout" className="mt-6 w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black">Checkout <ArrowRight className="w-4 h-4" /></Link>
          </aside>
        </div>
      )}
    </main>
  );
}
