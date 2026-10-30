import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { MetascoreBadge } from "@/components/MetascoreBadge";
import { MediaImage } from "@/components/MediaImage";
import { safeJsonParse } from "@/lib/utils";
import {
  ArrowRight,
  Gamepad2,
  MessageSquare,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export default async function HomePage() {
  const [featuredGames, trendingGames, latestDiscussions, latestCreatorPosts, storeProducts] =
    await Promise.all([
      prisma.game.findMany({
        orderBy: [{ overallScore: "desc" }, { reviewCount: "desc" }],
        take: 3,
      }),
      prisma.game.findMany({
        orderBy: [{ discussionCount: "desc" }, { overallScore: "desc" }],
        take: 4,
      }),
      prisma.comment.findMany({
        where: { parentId: null, reviewId: null, isDeleted: false },
        include: {
          game: { select: { slug: true, title: true } },
          author: { select: { name: true, role: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.creatorPost.findMany({
        include: { author: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.product.findMany({
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
        take: 3,
      }),
    ]);

  return (
    <main className="flex-1 w-full">
      <section className="border-b border-zinc-800/80 bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.18),transparent_45%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Gamepad2 className="h-3.5 w-3.5" />
              Gaming discovery, reviews & community
            </div>
            <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.02]">
              Find your next game.
              <span className="block text-indigo-400">See what the community thinks.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-zinc-400">
              Nexus brings game scores, creator perspectives, player reviews, community discussions,
              and gaming gear together in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/games"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white transition hover:bg-indigo-500"
              >
                Explore Games <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/70 px-6 py-3.5 font-bold text-zinc-200 transition hover:border-amber-500/50 hover:text-white"
              >
                Join the Community <MessageSquare className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Star, label: "Game Scores", href: "/games", color: "text-emerald-400" },
              { icon: Users, label: "Creators", href: "/creators", color: "text-amber-400" },
              { icon: MessageSquare, label: "Community", href: "/community", color: "text-sky-400" },
              { icon: ShoppingBag, label: "Gaming Gear", href: "/store", color: "text-indigo-400" },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link key={label} href={href} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 hover:border-zinc-700 transition">
                <Icon className={`h-5 w-5 ${color}`} />
                <div className="mt-3 text-sm font-bold text-white">{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Scores worth seeing</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">Featured games</h2>
              <p className="mt-1 text-sm text-zinc-500">Explore highly rated games across the Nexus score system.</p>
            </div>
            <Link href="/games" className="shrink-0 text-sm font-bold text-indigo-400 hover:text-indigo-300">View all</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredGames.map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 h-80">
                <MediaImage src={game.coverImage} alt={`${game.title} cover art`} fallbackLabel="Game artwork unavailable" priority className="transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-indigo-300">{game.title}</h3>
                    <p className="mt-1 text-xs text-zinc-400">{game.reviewCount} reviews · {game.discussionCount} discussions</p>
                  </div>
                  <MetascoreBadge score={game.overallScore} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">Trending now</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">Games people are talking about</h2>
            </div>
            <Link href="/community" className="shrink-0 text-sm font-bold text-indigo-400 hover:text-indigo-300">Open community</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingGames.map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`} className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-amber-500/40 transition">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                  <MediaImage src={game.coverImage} alt="" fallbackLabel="Artwork unavailable" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white line-clamp-2">{game.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                    {game.discussionCount} discussions
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">Nexus {game.overallScore}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-sky-400">Community</p>
                <h2 className="mt-1 text-2xl font-black text-white">What players are discussing</h2>
              </div>
              <Link href="/community" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">View all</Link>
            </div>
            <div className="space-y-3">
              {latestDiscussions.map((thread) => (
                <Link key={thread.id} href={thread.game ? `/games/${thread.game.slug}#community` : "/community"} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-sky-500/40 transition">
                  <div className="flex justify-between gap-3 text-xs text-zinc-500">
                    <span className="font-bold text-zinc-300">{thread.author.name}</span>
                    <span>{thread._count.replies} replies</span>
                  </div>
                  <h3 className="mt-2 font-bold text-white line-clamp-2">{thread.content.split(/\r?\n/)[0]}</h3>
                  <p className="mt-1 text-xs text-zinc-500">{thread.game?.title ?? "Nexus Community"}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-400">Creators</p>
                <h2 className="mt-1 text-2xl font-black text-white">Fresh creator activity</h2>
              </div>
              <Link href="/creators" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Discover creators</Link>
            </div>
            <div className="space-y-3">
              {latestCreatorPosts.map((post) => (
                <Link key={post.id} href={`/creators/${post.authorId}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-4 hover:border-amber-500/40 transition">
                  <div className="text-xs font-bold text-zinc-500">{post.author.name}</div>
                  <h3 className="mt-2 font-bold text-white line-clamp-1">{post.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500 line-clamp-2">{post.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400">Nexus Store</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white">Gear for your next session</h2>
            </div>
            <Link href="/store" className="shrink-0 text-sm font-bold text-indigo-400 hover:text-indigo-300">Shop all gear</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {storeProducts.map((product) => {
              const image = safeJsonParse<string[]>(product.imagesJson, [])[0] || "/media-fallback.svg";
              return (
                <Link key={product.id} href={`/store/${product.slug}`} className="group rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden hover:border-indigo-500/50 transition">
                  <div className="h-36"><MediaImage src={image} alt={`${product.name} product image`} fallbackLabel="Product image unavailable" /></div>
                  <div className="p-4">
                    <p className="text-[10px] uppercase font-black tracking-wider text-indigo-400">{product.brand}</p>
                    <h3 className="mt-1 font-bold text-white group-hover:text-indigo-300">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="font-black text-white">${product.price.toFixed(2)}</span>
                      <span className="text-zinc-500">{product.stock > 0 ? "In stock" : "Sold out"}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
