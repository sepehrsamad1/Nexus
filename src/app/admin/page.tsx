import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RoleSelect } from '@/components/admin/RoleSelect';
import { ModerationList } from '@/components/admin/ModerationList';
import { DemoMaintenance } from '@/components/admin/DemoMaintenance';
import { ShieldCheck, TrendingUp, Users, DollarSign, Package, Key, MessageSquare } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';

export default async function AdminDashboard() {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') redirect('/');

  const [totalRevenueResult, totalOrders, totalUsers, hardware, games, comments, adminCount] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.findMany({ orderBy: { stock: 'asc' }, select: { id: true, name: true, stock: true } }),
    prisma.game.findMany({ select: { id: true, title: true, stockKeysJson: true }, orderBy: { title: 'asc' } }),
    prisma.comment.findMany({
      where: { isDeleted: false }, take: 10, orderBy: { createdAt: 'desc' },
      select: { id: true, content: true, author: { select: { name: true } }, game: { select: { title: true } } },
    }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  const totalRevenue = totalRevenueResult._sum.totalAmount || 0;
  const users = await prisma.user.findMany({ take: 12, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, role: true, image: true } });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3"><ShieldCheck className="w-10 h-10 text-rose-500" /><div><h1 className="text-4xl font-black text-white">Nexus Admin</h1><p className="text-zinc-400 text-sm">Prototype-only controls for users, community moderation, inventory, and deterministic demo maintenance.</p></div></div>
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">Demo admin portal. Role changes and moderation are validated server-side. No secrets, raw SQL, or destructive database commands are exposed here.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"><DollarSign className="w-5 h-5 text-indigo-400 mb-3" /><div className="text-zinc-400 text-sm">Demo revenue</div><div className="text-3xl font-black text-white font-mono">$<span>{totalRevenue.toFixed(2)}</span></div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"><TrendingUp className="w-5 h-5 text-emerald-400 mb-3" /><div className="text-zinc-400 text-sm">Orders</div><div className="text-3xl font-black text-white font-mono">{totalOrders}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"><Users className="w-5 h-5 text-purple-400 mb-3" /><div className="text-zinc-400 text-sm">Users / admins</div><div className="text-3xl font-black text-white font-mono">{totalUsers} / {adminCount}</div></div>
      </div>

      <div className="space-y-8">
        <DemoMaintenance />
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 border-b border-zinc-800 pb-3"><Users className="w-5 h-5 text-purple-400" /><div><h2 className="text-xl font-bold text-white">User & role management</h2><p className="text-xs text-zinc-500">Validated demo roles: USER, STREAMER, EXPERT, ADMIN.</p></div></div>
          <div className="space-y-3">{users.map(u => (
            <div key={u.id} className="flex items-center justify-between gap-4 bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
              <div className="flex items-center gap-3 min-w-0"><img src={u.image || ('https://api.dicebear.com/7.x/avataaars/svg?seed=' + u.id)} className="w-8 h-8 rounded-full" alt="" /><div className="min-w-0"><div className="font-bold text-zinc-200 text-sm truncate">{u.name}</div><div className="text-xs text-zinc-600">Demo account · {u.role}</div></div></div>
              <RoleSelect userId={u.id} currentRole={u.role} />
            </div>
          ))}</div>
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 border-b border-zinc-800 pb-3"><MessageSquare className="w-5 h-5 text-rose-400" /><div><h2 className="text-xl font-bold text-white">Community moderation</h2><p className="text-xs text-zinc-500">Hide active comments with reversible soft moderation. Nothing is hard-deleted from this UI.</p></div></div>
          <ModerationList comments={comments} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"><h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 border-b border-zinc-800 pb-3"><Key className="w-5 h-5 text-emerald-400" /> Digital keys inventory</h2><div className="space-y-2">{games.map(g => { const keys = safeJsonParse<string[]>(g.stockKeysJson, []); return <div key={g.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg"><span className="text-sm font-bold text-zinc-300 truncate">{g.title}</span><span className={keys.length < 2 ? 'px-2 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-400' : 'px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400'}>{keys.length} keys</span></div>; })}</div></section>
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"><h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2 border-b border-zinc-800 pb-3"><Package className="w-5 h-5 text-amber-400" /> Physical gear inventory</h2><div className="space-y-2">{hardware.map(hw => <div key={hw.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg"><span className="text-sm font-bold text-zinc-300 truncate">{hw.name}</span><span className={hw.stock < 10 ? 'px-2 py-1 rounded text-xs font-bold bg-rose-500/20 text-rose-400' : 'px-2 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400'}>{hw.stock} in stock</span></div>)}</div></section>
        </div>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6"><h2 className="text-lg font-bold text-white">Full demo reset stays CLI-only</h2><p className="mt-2 text-sm text-zinc-500">The deterministic <code className="text-zinc-300">npm.cmd run db:seed</code> operation intentionally remains outside the browser because it clears and rebuilds the demo dataset. This prevents an accidental destructive reset from a casual admin click.</p></section>
      </div>
    </main>
  );
}
