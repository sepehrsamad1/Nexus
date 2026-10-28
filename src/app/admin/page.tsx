import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RoleSelect } from '@/components/admin/RoleSelect';
import { ShieldCheck, TrendingUp, Users, DollarSign, Package, Key } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';

export default async function AdminDashboard() {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') redirect('/'); // Hard redirect for non-admins

  // Fetch KPI Data
  const [totalRevenueResult, totalOrders, totalUsers, hardware, games] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.findMany({ orderBy: { stock: 'asc' } }),
    prisma.game.findMany({ select: { id: true, title: true, stockKeysJson: true } })
  ]);

  const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

  // Fetch recent users for role management
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <div className="flex items-center gap-3 mb-10 border-b border-zinc-800 pb-6">
        <ShieldCheck className="w-10 h-10 text-rose-500" />
        <div>
          <h1 className="text-4xl font-black text-white">Admin & Creator Portal</h1>
          <p className="text-zinc-400 text-sm">Manage inventory, approve streamers, and view KPIs.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/10" />
          <div className="text-zinc-400 font-bold mb-2">Total Revenue</div>
          <div className="text-4xl font-black text-white font-mono">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10" />
          <div className="text-zinc-400 font-bold mb-2">Total Orders</div>
          <div className="text-4xl font-black text-white font-mono">{totalOrders}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-purple-500/10" />
          <div className="text-zinc-400 font-bold mb-2">Registered Users</div>
          <div className="text-4xl font-black text-white font-mono">{totalUsers}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Inventory */}
        <div className="space-y-8">
          {/* Game Keys Inventory */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Key className="w-5 h-5 text-emerald-400" /> Digital Keys Stock
            </h2>
            <div className="space-y-4">
              {games.map(g => {
                const keys = safeJsonParse<string[]>(g.stockKeysJson, []);
                return (
                  <div key={g.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                    <span className="font-bold text-zinc-300 text-sm line-clamp-1">{g.title}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${keys.length < 2 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {keys.length} Keys Left
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hardware Inventory */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Package className="w-5 h-5 text-amber-400" /> Physical Gear Stock
            </h2>
            <div className="space-y-4">
              {hardware.map(hw => (
                <div key={hw.id} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                  <span className="font-bold text-zinc-300 text-sm line-clamp-1">{hw.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold font-mono ${hw.stock < 10 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {hw.stock} in Stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: User Management */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Users className="w-5 h-5 text-purple-400" /> Streamer & Expert Verification
          </h2>
          <p className="text-xs text-zinc-500 mb-6">Upgrade regular users to STREAMER or EXPERT so they can post VOD reviews and professional critiques.</p>
          
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <img src={u.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} className="w-8 h-8 rounded-full" alt="avatar"/>
                  <div>
                    <div className="font-bold text-zinc-200 text-sm">{u.name}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </div>
                </div>
                <RoleSelect userId={u.id} currentRole={u.role} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
