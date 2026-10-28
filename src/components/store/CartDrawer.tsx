'use client';

import { useCart } from '@/store/useCart';
import { X, Trash2, ShoppingCart, Minus, Plus, Package, Key } from 'lucide-react';
import Link from 'next/link';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getTotal } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" /> Your Cart
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-indigo-600/10 text-indigo-400 rounded-full text-sm font-bold border border-indigo-500/20"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-zinc-800" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-bold text-sm line-clamp-1">{item.name}</h3>
                    <div className="text-xs font-medium mt-1 flex items-center gap-1 text-zinc-400">
                      {item.type === 'DIGITAL_KEY' ? <Key className="w-3 h-3 text-emerald-400" /> : <Package className="w-3 h-3 text-amber-400" />}
                      {item.type === 'DIGITAL_KEY' ? 'Instant Digital Delivery' : 'Physical Shipping'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-mono text-indigo-400 font-bold">${item.price.toFixed(2)}</span>
                    <div className="flex items-center gap-2 bg-zinc-950 rounded-lg border border-zinc-800 p-0.5">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-zinc-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 text-zinc-400 hover:text-white"><Plus className="w-3 h-3" /></button>
                      <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-rose-500 hover:text-rose-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
            <div className="flex justify-between text-zinc-400 mb-2 text-sm">
              <span>Subtotal</span>
              <span className="font-mono">${getTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-black text-xl mb-6">
              <span>Total</span>
              <span className="font-mono">${getTotal().toFixed(2)}</span>
            </div>
            <Link 
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-center flex items-center justify-center transition-colors shadow-lg shadow-indigo-500/20"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
