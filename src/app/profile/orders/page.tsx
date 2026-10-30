import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { safeJsonParse } from '@/lib/utils';
import { RevealKeyButton } from '@/components/orders/RevealKeyButton';
import { Package, Key, Archive, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function OrdersPage() {
  const session = await getSession();
  if (!session?.user) redirect('/');

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-4xl font-black text-white mb-8 border-b border-zinc-800 pb-6 flex items-center gap-3">
        <Archive className="w-8 h-8 text-indigo-400" /> My Library & Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <Archive className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-zinc-500 mb-6">When you buy games or gear, they will appear here.</p>
          <Link href="/store" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition">
            Visit Store <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => {
            const keys = safeJsonParse<{gameTitle: string, key: string}[]>(order.deliveredKeysJson, []);
            
            return (
              <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-zinc-950/80 p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <div className="text-zinc-500 mb-1">Order Placed</div>
                      <div className="text-zinc-300 font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 mb-1">Total</div>
                      <div className="text-zinc-300 font-medium font-mono">${order.totalAmount.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 mb-1">Order ID</div>
                      <div className="text-zinc-300 font-medium font-mono">#{order.id.slice(0,8).toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3"><span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-bold uppercase tracking-wider w-fit">{order.status}</span><Link href={`/profile/orders/${order.id}`} className="text-xs font-bold text-indigo-300 hover:text-indigo-200">View details</Link></div>
                </div>

                <div className="p-6">
                  {/* Digital Keys Section */}
                  {keys.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-emerald-400" /> Digital Game Keys
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {keys.map((k, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                            <div className="font-bold text-zinc-300">{k.gameTitle}</div>
                            <RevealKeyButton gameKey={k.key} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physical Gear Section */}
                  {order.items.some(i => i.category !== 'GAME_KEY') && (
                    <div>
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 pt-4 border-t border-zinc-800">
                        <Package className="w-5 h-5 text-amber-400" /> Physical Shipment
                      </h3>
                      <div className="space-y-3">
                        {order.items.filter(i => i.category !== 'GAME_KEY').map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                            <span className="font-medium text-zinc-300">{item.name}</span>
                            <span className="text-zinc-500 font-mono">Qty: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
