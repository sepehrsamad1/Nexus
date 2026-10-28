import React from "react";
import { Gamepad2, MessageSquare, ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto w-full text-center mt-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-8">
          <CheckCircle2 className="w-4 h-4" />
          <span>Part 2 Active: RBAC Navbar & Database Seeding Complete</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Where <span className="text-emerald-400">Experts & Streamers</span> Grade Games,{" "}
          <span className="text-amber-400">Communities Debate</span>, &{" "}
          <span className="text-indigo-400">Gamers Gear Up</span>.
        </h1>

        <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-12">
          Your database has been successfully seeded with 6 flagship games, 24 reviews, 45 Reddit-style comments, and 12 hardware products. 
          Use the <strong>Role Switcher</strong> in the top right to instantly test the platform as different users.
        </p>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link href="/games" className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition group">
            <Gamepad2 className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 mb-3 transition-colors" />
            <span className="font-bold">Browse Games</span>
            <span className="text-xs text-zinc-500 mt-1">Metacritic Hub</span>
          </Link>
          
          <Link href="/community" className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/50 transition group">
            <MessageSquare className="w-8 h-8 text-zinc-500 group-hover:text-amber-400 mb-3 transition-colors" />
            <span className="font-bold">Community</span>
            <span className="text-xs text-zinc-500 mt-1">Reddit Review Threads</span>
          </Link>

          <Link href="/store" className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition group">
            <ShoppingBag className="w-8 h-8 text-zinc-500 group-hover:text-indigo-400 mb-3 transition-colors" />
            <span className="font-bold">Gear Store</span>
            <span className="text-xs text-zinc-500 mt-1">Equipment & Keys</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
