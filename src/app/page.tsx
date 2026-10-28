import React from "react";
import { Gamepad2, MessageSquare, ShoppingBag, ShieldCheck, Tv, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col justify-between">
      {/* Top Status Banner */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center font-black text-xl text-zinc-950 shadow-lg shadow-indigo-500/20">
              N
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                NEXUS<span className="text-indigo-400">.GG</span>
              </span>
              <span className="ml-3 text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                Part 1 Initialized
              </span>
            </div>
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            SQLite + Prisma ORM Ready • Next.js 15 App Router
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Metacritic Grading + Reddit Review Threads + Gaming Storefront</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight">
          Where <span className="text-emerald-400">Experts & Streamers</span> Grade Games,{" "}
          <span className="text-amber-400">Communities Debate</span>, &{" "}
          <span className="text-indigo-400">Gamers Gear Up</span>.
        </h1>

        <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-12">
          Foundation scaffolded successfully. Your unified Prisma SQLite schema (Users, Games,
          Streamer VOD Reviews, Infinite Nested Comments, Upvotes/Downvotes, Hardware Inventory, and
          Digital Key Orders) is active.
        </p>

        {/* 3 Core Pillars Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Tv className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">1. Metacritic Grading</h3>
              <span className="px-2.5 py-1 rounded-md bg-emerald-500 text-zinc-950 font-black text-xs">
                94
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Separate weighted scores for Verified Critics, Featured Streamers (with embedded VOD
              reviews), and Community players.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">2. Reddit Review Threads</h3>
              <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-xs">
                +1.4k Karma
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every Streamer & Expert review opens its own collapsible, infinitely nested Reddit
              comment tree with live upvotes and author badges.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 hover:border-indigo-500/50 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">3. Pro Gear & Game Keys</h3>
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs">
                Instant Key
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Buy instant digital activation keys for the game being reviewed or the exact mice,
              keyboards, and headsets used by the streamer.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Milestone Status */}
      <footer className="border-t border-zinc-800/80 bg-zinc-900/30 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Milestone 1 Complete: Next.js 15 + Tailwind Dark Theme + Prisma SQLite Schema</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-zinc-400">
            <Gamepad2 className="w-4 h-4 text-indigo-400" />
            <span>Next Step: Run Part 2 to seed games, streamers, reviews, and RBAC Navbar</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
