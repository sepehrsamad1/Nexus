import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { MetascoreBadge } from "@/components/MetascoreBadge";
import { MediaImage } from "@/components/MediaImage";
import { Gamepad2, MessageSquare, ShoppingBag, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const [topGames, latestDiscussions] = await Promise.all([
    prisma.game.findMany({ orderBy: { expertScore: 'desc' }, take: 3 }),
    prisma.comment.findMany({
      where: { parentId: null, reviewId: null, isDeleted: false },
      include: {
        game: { select: { slug: true, title: true } },
        author: { select: { name: true, role: true } },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
  ]);

  return (
    <main className="flex-1 flex flex-col p-6 pb-20 max-w-7xl mx-auto w-full">
      <section className="text-center mt-12 mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-8">
          <span>Nexus Gaming Ecosystem</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl mx-auto">
          Where <span className="text-emerald-400">Experts & Streamers</span> Grade Games,{" "}
          <span className="text-amber-400">Communities Debate</span>.
        </h1>
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/games" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition flex items-center gap-2">
            Browse Games Directory <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
          <h2 className="text-2xl font-black flex items-center gap-2 text-white">
            <Gamepad2 className="text-emerald-400 w-6 h-6" /> Highest Rated by Critics
          </h2>
          <Link href="/games" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topGames.map(game => (
            <Link key={game.id} href={`/games/${game.slug}`} className="group relative rounded-2xl overflow-hidden h-72 border border-zinc-800 hover:border-indigo-500 transition-colors">
              <MediaImage src={game.coverImage} alt={`${game.title} cover art`} fallbackLabel="Game artwork unavailable" priority className="group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{game.title}</h3>
                  <div className="text-sm text-zinc-400">View Reviews & VODs</div>
                </div>
                <MetascoreBadge score={game.expertScore} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 text-white">
              <MessageSquare className="text-amber-400 w-6 h-6" /> Community Activity
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Latest game-specific discussions and replies.</p>
          </div>
          <Link href="/community" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">View Community</Link>
        </div>
        {latestDiscussions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestDiscussions.map(thread => (
              <Link key={thread.id} href={`/games/${thread.game!.slug}#community`} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-amber-500/40 transition group">
                <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
                  <span className="font-bold text-zinc-300">{thread.author.name}</span>
                  <span>{thread._count.replies} replies</span>
                </div>
                <h3 className="mt-3 font-black text-white line-clamp-2 group-hover:text-amber-300">{thread.content.split(/\r?\n/)[0]}</h3>
                <p className="mt-2 text-sm text-zinc-500">{thread.game?.title}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">No community discussions yet.</div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
        <Link href="/community" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800/50 transition group">
          <MessageSquare className="w-10 h-10 text-zinc-500 group-hover:text-amber-400 mb-4 transition-colors" />
          <span className="font-black text-xl text-white">Community Debates</span>
          <span className="text-sm text-zinc-500 mt-2 text-center">Dive into Reddit-style comment trees under Streamer reviews.</span>
        </Link>
        <Link href="/store" className="flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/50 transition group">
          <ShoppingBag className="w-10 h-10 text-zinc-500 group-hover:text-indigo-400 mb-4 transition-colors" />
          <span className="font-black text-xl text-white">Pro Gear Store</span>
          <span className="text-sm text-zinc-500 mt-2 text-center">Discover gaming gear and digital game keys.</span>
        </Link>
      </section>
    </main>
  );
}
