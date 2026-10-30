import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { RootCommentForm } from '@/components/discussion/RootCommentForm';
import { VotingArrows } from '@/components/discussion/VotingArrows';
import { getSession } from '@/lib/auth';
import { MessageSquare, Flame, Clock3, Gamepad2, ArrowRight } from 'lucide-react';

type CommunitySearchParams = {
  game?: string;
  sort?: string;
};

function discussionScore(upvotes: number, downvotes: number, createdAt: Date) {
  const ageHours = Math.max(1, (Date.now() - createdAt.getTime()) / 3_600_000);
  return (upvotes - downvotes) / Math.pow(ageHours + 2, 0.35);
}

export default async function CommunityFrontPage({
  searchParams,
}: {
  searchParams: Promise<CommunitySearchParams>;
}) {
  const params = await searchParams;
  const session = await getSession();
  const sort = params.sort === 'new' ? 'new' : 'hot';

  const [games, selectedGame] = await Promise.all([
    prisma.game.findMany({
      select: { id: true, slug: true, title: true },
      orderBy: { title: 'asc' },
    }),
    params.game
      ? prisma.game.findUnique({
          where: { slug: params.game },
          select: { id: true, slug: true, title: true },
        })
      : Promise.resolve(null),
  ]);

  const roots = selectedGame || !params.game ? await prisma.comment.findMany({
    where: {
      parentId: null,
      isDeleted: false,
      gameId: selectedGame?.id ?? { not: null },
    },
    include: {
      author: { select: { id: true, name: true, image: true, role: true } },
      game: { select: { id: true, slug: true, title: true, expertScore: true } },
      review: { select: { id: true, title: true } },
      _count: { select: { replies: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 40,
  }) : [];

  const orderedRoots = sort === 'hot'
    ? [...roots].sort((a, b) => discussionScore(b.upvotes, b.downvotes, b.createdAt) - discussionScore(a.upvotes, a.downvotes, a.createdAt))
    : roots;

  const rootVotes = session?.user
    ? await prisma.vote.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: orderedRoots.map(comment => comment.id) },
        },
        select: { commentId: true, value: true },
      })
    : [];
  const voteMap = new Map(rootVotes.map(vote => [vote.commentId, vote.value as 1 | -1]));

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      <div className="flex flex-col gap-6 border-b border-zinc-800 pb-7">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Nexus Community</p>
            <h1 className="mt-2 text-4xl font-black text-white">Game Discussions</h1>
            <p className="text-zinc-400 mt-2 max-w-2xl">
              A Reddit-style discussion layer for Nexus games: vote, reply, follow the thread, and discover what players are talking about.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={selectedGame ? `/community?game=${selectedGame.slug}&sort=hot` : '/community?sort=hot'}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${sort === 'hot' ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-300'}`}
            >
              <Flame className="w-4 h-4" /> Hot
            </Link>
            <Link
              href={selectedGame ? `/community?game=${selectedGame.slug}&sort=new` : '/community?sort=new'}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${sort === 'new' ? 'bg-indigo-500/15 text-indigo-300' : 'bg-zinc-800 text-zinc-300'}`}
            >
              <Clock3 className="w-4 h-4" /> New
            </Link>
          </div>
        </div>

        <form action="/community" method="get" className="flex flex-col sm:flex-row gap-3">
          <select
            name="game"
            defaultValue={selectedGame?.slug ?? ''}
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white"
          >
            <option value="">All games</option>
            {games.map(game => <option key={game.id} value={game.slug}>{game.title}</option>)}
          </select>
          <input type="hidden" name="sort" value={sort} />
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold">Filter</button>
        </form>
      </div>

      {selectedGame && session?.user && (
        <div className="mt-6">
          <RootCommentForm gameId={selectedGame.id} />
        </div>
      )}

      {!session?.user && (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 p-5 text-sm text-zinc-500">
          Sign in to start a discussion or vote. The current Nexus prototype uses its explicit demo persona system.
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">{selectedGame ? selectedGame.title : 'Latest discussions'}</h2>
          <p className="text-sm text-zinc-500">{orderedRoots.length} discussion threads shown</p>
        </div>
        {selectedGame && <Link href={`/games/${selectedGame.slug}#community`} className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Open game page <ArrowRight className="inline w-4 h-4" /></Link>}
      </div>

      <div className="mt-5 space-y-4">
        {orderedRoots.map(thread => {
          const game = thread.game;
          if (!game) return null;

          return (
          <article key={thread.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
            <div className="flex gap-4">
              <VotingArrows
                targetId={thread.id}
                type="COMMENT"
                initialUpvotes={thread.upvotes}
                initialDownvotes={thread.downvotes}
                initialUserVote={voteMap.get(thread.id) ?? 0}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="font-bold text-zinc-200">{thread.author.name}</span>
                  <span>•</span>
                  <time dateTime={thread.createdAt.toISOString()}>{thread.createdAt.toLocaleString()}</time>
                  <span>•</span>
                  <Link href={`/games/${game.slug}`} className="font-bold text-indigo-400 hover:text-indigo-300">{game.title}</Link>
                  {thread.author.role === 'STREAMER' && <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-purple-300">Creator</span>}
                  {thread.author.role === 'EXPERT' && <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">Expert</span>}
                </div>

                <h3 className="mt-2 text-lg font-black text-white leading-snug">
                  {thread.content.split(/\r?\n/)[0].slice(0, 120)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400 line-clamp-3">{thread.content}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500">
                  <span className="inline-flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {thread._count.replies} replies</span>
                  {thread.review ? (
                    <Link href={`/reviews/${thread.review.id}`} className="text-indigo-400 hover:text-indigo-300">Review thread</Link>
                  ) : (
                    <Link href={`/games/${game.slug}#community`} className="text-indigo-400 hover:text-indigo-300">Game discussion</Link>
                  )}
                  <span>{thread.upvotes - thread.downvotes} net votes</span>
                </div>
              </div>
              <div className="hidden sm:block shrink-0 pt-1">
                <MetascoreBadge score={game.expertScore} size="sm" />
              </div>
            </div>
          </article>
          );
        })}
      </div>

      {orderedRoots.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center">
          <Gamepad2 className="mx-auto w-10 h-10 text-zinc-700" />
          <h2 className="mt-4 text-lg font-bold text-white">No discussions yet</h2>
          <p className="mt-2 text-sm text-zinc-500">
            {params.game && !selectedGame ? 'That game filter is not available. Choose a game from the list above.' : selectedGame ? 'Start the first respectful discussion for this game.' : 'Choose a game above or check back when the community has new threads.'}
          </p>
        </div>
      )}
    </main>
  );
}
