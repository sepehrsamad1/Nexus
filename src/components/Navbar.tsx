import Link from 'next/link';
import { Search, Gamepad2, Users, ShoppingBag, Heart, Home } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';
import { getSession } from '@/lib/auth';
import { CartIcon } from '@/components/store/CartIcon';
import { CartDrawer } from '@/components/store/CartDrawer';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/games', label: 'Games', icon: Gamepad2 },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/creators', label: 'Creators', icon: Users },
  { href: '/store', label: 'Store', icon: ShoppingBag },
];

export async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-5 lg:gap-8 min-w-0">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-zinc-950">N</div>
              <span className="font-black text-lg tracking-tight text-white group-hover:text-indigo-400">NEXUS</span>
            </Link>
            <div className="hidden md:flex items-center gap-5 lg:gap-6">
              {navItems.slice(1).map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition">
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <form action="/search" method="get" className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                name="q"
                type="search"
                placeholder="Search games, gear..."
                aria-label="Global search"
                className="w-48 lg:w-64 pl-9 pr-4 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-full text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
              />
            </form>
            <Link href="/search" aria-label="Open global search" className="sm:hidden p-2 text-zinc-400 hover:text-white">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="p-2 text-zinc-400 hover:text-rose-300 transition">
              <Heart className="w-5 h-5" />
            </Link>
            <CartIcon />
            <div className="h-6 w-px bg-zinc-800 mx-1" />
            <RoleSwitcher currentRole={user?.role} />
          </div>
        </div>

        <div className="md:hidden border-t border-zinc-900/80">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-1 overflow-x-auto">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
