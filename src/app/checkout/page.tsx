'use client';

import { useCart } from '@/store/useCart';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fulfillMockOrder } from '@/actions/order';
import { CreditCard, Package, Key, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Call API route (Mock/Stripe routing)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total })
      });
      const data = await res.json();

      if (data.simulated) {
        // 2. Actually fulfill the order via Server Action
        await fulfillMockOrder(items, total);
        
        setSuccess(true);
        clearCart();
        
        setTimeout(() => {
          router.push('/profile/orders');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Check stock levels.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 max-w-lg text-center shadow-2xl">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-white mb-2">Order Complete!</h1>
          <p className="text-zinc-400 mb-8">Your digital keys have been delivered and physical gear is preparing for shipment.</p>
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-zinc-500 mt-4">Redirecting to your library...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-4xl font-black text-white mb-8 border-b border-zinc-800 pb-6 flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-indigo-400" /> Secure Checkout
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 mb-6">Your cart is empty.</p>
          <Link href="/store" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">Return to Store</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <img src={item.image} className="w-12 h-12 rounded object-cover" alt="" />
                    <div>
                      <div className="font-bold text-zinc-200">{item.name}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        {item.type === 'DIGITAL_KEY' ? <Key className="w-3 h-3 text-emerald-400"/> : <Package className="w-3 h-3 text-amber-400"/>}
                        Qty: {item.quantity}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-indigo-400 font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-6">
              <div className="flex justify-between text-white text-2xl font-black">
                <span>Total</span>
                <span className="font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Simulation */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
            
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-8 text-sm text-indigo-300">
              <strong>Local Development Mode Active:</strong> Clicking the button below will instantly fulfill the order using a simulated transaction and distribute keys from the database.
            </div>

            <div className="space-y-4 mb-8 opacity-50 pointer-events-none">
              <div className="h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center px-4 text-zinc-500">Card Number: **** **** **** 4242</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center px-4 text-zinc-500">MM/YY</div>
                <div className="h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center px-4 text-zinc-500">CVC</div>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isProcessing ? 'Processing Order...' : `Pay $${total.toFixed(2)} (Simulated)`} 
              {!isProcessing && <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
