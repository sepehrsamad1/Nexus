import Link from 'next/link';
import { Search, Gamepad2, Users, ShoppingBag } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { getSession } from '@/lib/auth';
import { CartIcon } from '@/components/store/CartIcon';
import { CartDrawer } from '@/components/store/CartDrawer';

export async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-zinc-950">
                N
              </div>
              <span className="font-bold text-lg tracking-tight group-hover:text-indigo-400 transition-colors">
                NEXUS
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/games" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                <Gamepad2 className="w-4 h-4" /> Games
              </Link>
              <Link href="/community" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                <Users className="w-4 h-4" /> Community
              </Link>
              <Link href="/store" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
                <ShoppingBag className="w-4 h-4" /> Gear Store
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form action="/search" method="get" className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="q"
                type="search"
                placeholder="Search games, gear..."
                aria-label="Global search"
                className="w-64 pl-9 pr-4 py-1.5 text-sm bg-zinc-900 border border-zinc-800 rounded-full text-zinc-200 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-zinc-600"
              />
            </form>

            <CartIcon />
            <div className="h-6 w-px bg-zinc-800 mx-2"></div>
            <RoleSwitcher currentRole={user?.role} />
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
