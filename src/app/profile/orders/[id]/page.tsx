import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { safeJsonParse } from '@/lib/utils';
import { RevealKeyButton } from '@/components/orders/RevealKeyButton';
import { ArrowLeft, Package, Key, Receipt } from 'lucide-react';
import Link from 'next/link';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user) redirect('/');
  const { id } = await params;
  const order = await prisma.order.findFirst({ where: { id, userId: session.user.id }, include: { items: true } });
  if (!order) notFound();
  const keys = safeJsonParse<{ gameTitle: string; key: string }[]>(order.deliveredKeysJson, []);
  const orderNumber = 'NEXUS-' + order.id.slice(-8).toUpperCase();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <Link href="/profile/orders" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300 hover:text-indigo-200 mb-6"><ArrowLeft className="w-4 h-4" /> Back to orders</Link>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div><p className="text-xs font-black uppercase tracking-widest text-indigo-300">Order detail</p><h1 className="text-4xl font-black text-white mt-1">{orderNumber}</h1><p className="text-zinc-500 mt-2">{new Date(order.createdAt).toLocaleString()}</p></div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">{order.status}</span>
      </div>
      <div className="grid gap-6">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2 mb-5"><Receipt className="w-5 h-5 text-indigo-400" /> Order summary</h2>
          <div className="space-y-3">{order.items.map(item => <div key={item.id} className="flex justify-between gap-4 border-b border-zinc-800 pb-3 last:border-0"><div><div className="font-bold text-zinc-200">{item.name}</div><div className="text-xs text-zinc-500">Qty {item.quantity} · {item.category}</div></div><div className="font-mono text-indigo-300">$ { (item.price * item.quantity).toFixed(2) }</div></div>)}</div>
          <div className="border-t border-zinc-800 mt-5 pt-5 flex justify-between text-xl font-black text-white"><span>Total</span><span className="font-mono">$ {order.totalAmount.toFixed(2)}</span></div>
        </section>
        {keys.length > 0 && <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-black text-white flex items-center gap-2 mb-5"><Key className="w-5 h-5 text-emerald-400" /> Delivered digital keys</h2><div className="space-y-3">{keys.map((k,i)=><div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-zinc-950 border border-zinc-800 p-4"><span className="font-bold text-zinc-300">{k.gameTitle}</span><RevealKeyButton gameKey={k.key} /></div>)}</div></section>}
        {order.items.some(i => i.category !== 'GAME_KEY') && <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-xl font-black text-white flex items-center gap-2 mb-5"><Package className="w-5 h-5 text-amber-400" /> Physical items</h2><div className="space-y-2">{order.items.filter(i => i.category !== 'GAME_KEY').map(item => <div key={item.id} className="flex justify-between rounded-lg bg-zinc-950/60 p-3 text-sm"><span className="text-zinc-300">{item.name}</span><span className="text-zinc-500">Qty {item.quantity}</span></div>)}</div></section>}
      </div>
    </main>
  );
}
