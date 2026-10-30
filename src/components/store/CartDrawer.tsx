'use client';

import { useCart } from '@/store/useCart';
import { X, Trash2, ShoppingCart, Minus, Plus, Package, Key } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal } = useCart();
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[101] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-indigo-400" /> Your Cart</h2>
          <button aria-label="Close cart" onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Your cart is empty.</p>
              <button onClick={() => setIsOpen(false)} className="px-6 py-2 bg-indigo-600/10 text-indigo-400 rounded-full text-sm font-bold border border-indigo-500/20">Continue Shopping</button>
            </div>
          ) : items.map(item => (
            <div key={item.type + ':' + item.id} className="flex gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
              <img src={item.image} alt="" className="w-20 h-20 object-contain rounded-lg bg-zinc-800 p-1" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm line-clamp-2">{item.name}</h3>
                <div className="text-xs font-medium mt-1 flex items-center gap-1 text-zinc-400">
                  {item.type === 'DIGITAL_KEY' ? <Key className="w-3 h-3 text-emerald-400" /> : <Package className="w-3 h-3 text-amber-400" />}
                  {item.type === 'DIGITAL_KEY' ? 'Digital key' : 'Physical gear'}
                </div>
                <div className="flex items-center justify-between gap-2 mt-3">
                  <span className="font-mono text-indigo-400 font-bold">{'$' + (item.price * item.quantity).toFixed(2)}</span>
                  <div className="flex items-center gap-1 bg-zinc-950 rounded-lg border border-zinc-800 p-0.5">
                    <button aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.id, item.quantity - 1, item.type)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button aria-label="Increase quantity" disabled={item.quantity >= 99} onClick={() => updateQuantity(item.id, item.quantity + 1, item.type)} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                    <div className="w-px h-4 bg-zinc-800 mx-1" />
                    <button aria-label="Remove item" onClick={() => removeItem(item.id, item.type)} className="p-1 text-rose-500 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
            <div className="flex justify-between text-zinc-400 mb-2 text-sm"><span>Subtotal</span><span className="font-mono">{'$' + getTotal().toFixed(2)}</span></div>
            <div className="flex justify-between text-white font-black text-xl mb-3"><span>Total</span><span className="font-mono">{'$' + getTotal().toFixed(2)}</span></div>
            <p className="text-[11px] text-zinc-600 mb-4">Final prices, stock, and digital-key availability are checked again at checkout.</p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={() => setIsOpen(false)} className="py-3 border border-zinc-700 text-zinc-200 rounded-xl font-bold text-center hover:border-zinc-500">View Cart</Link>
              <Link href="/checkout" onClick={() => setIsOpen(false)} className="py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-center">Checkout</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
