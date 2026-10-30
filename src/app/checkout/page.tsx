'use client';

import { useCart } from '@/store/useCart';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Package, Key, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MediaImage } from '@/components/MediaImage';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentOutcome, setPaymentOutcome] = useState<'SUCCESS' | 'FAILURE'>('SUCCESS');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setError('');

    try {
      // 1. Call API route (Mock/Stripe routing)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, type, quantity }) => ({ id, type, quantity })),
          payment: { outcome: paymentOutcome },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed.');
      }

      if (data.simulated) {
        setOrderNumber(data.orderNumber || 'NEXUS-DEMO');
        setSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Checkout failed.');
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
          <p className="text-lg font-black text-indigo-300 font-mono mb-6">Order {orderNumber}</p>
          <Link href="/profile/orders" className="inline-flex px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold">View Order History</Link>
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
                    <div className="w-12 h-12 rounded overflow-hidden bg-zinc-900 shrink-0"><MediaImage src={item.image} alt="" fallbackLabel="Product image unavailable" className="object-cover" /></div>
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
            <h2 className="text-xl font-bold text-white mb-2">Payment Method</h2>
            <p className="text-xs text-amber-300 mb-5">Prototype simulation only — no real payment is processed and no card details are stored.</p>
            
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-8 text-sm text-indigo-300">
              <strong>Demo payment environment:</strong> The button below runs the simulated transaction and, on success, fulfills the demo order using the seeded catalog.
            </div>

            <div className="space-y-4 mb-8"><div className="h-12 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center px-4 text-zinc-500">Demo card field — not collected or stored</div><div className="grid grid-cols-2 gap-4"><div className="h-12 bg-zinc-950 border border-zinc-800 rounded-lg px-4 flex items-center text-zinc-500">Demo expiry</div><div className="h-12 bg-zinc-950 border border-zinc-800 rounded-lg px-4 flex items-center text-zinc-500">Demo CVC</div></div><label className="block text-sm text-zinc-400">Simulation result<select value={paymentOutcome} onChange={e => setPaymentOutcome(e.target.value as "SUCCESS" | "FAILURE")} className="mt-2 w-full h-12 bg-zinc-950 border border-zinc-800 rounded-lg px-4 text-zinc-200"><option value="SUCCESS">Successful payment</option><option value="FAILURE">Simulate payment failure</option></select></label></div>

            {error && <div role="alert" className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}
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
