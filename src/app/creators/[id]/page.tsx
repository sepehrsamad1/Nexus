import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { CreatorFollowButton } from '@/components/creators/CreatorFollowButton';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { ArrowLeft, Users, Video } from 'lucide-react';

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const creator = await prisma.user.findUnique({
    where: { role: 'STREAMER', OR: [{ id }, { creatorProfile: { handle: id } }] },
    include: {
      creatorProfile: true,
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: { game: true },
        take: 12,
      },
      creatorPosts: { orderBy: { createdAt: 'desc' }, take: 8 },
      _count: { select: { followers: true, following: true, reviews: true, comments: true, creatorPosts: true } },
    },
  });

  if (!creator?.creatorProfile) notFound();

  const following = session?.user
    ? Boolean(await prisma.creatorFollow.findUnique({
        where: { followerId_followingId: { followerId: session.user.id, followingId: creator.id } },
        select: { id: true },
      }))
    : false;

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/creators" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Creator Discovery
        </Link>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <img src={creator.image || '/media-fallback.svg'} alt="" className="h-24 w-24 rounded-2xl border border-zinc-700 bg-zinc-950 object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Video className="h-5 w-5 text-purple-400" />
                <span className="text-xs font-black uppercase tracking-widest text-purple-400">Creator</span>
                {creator.creatorProfile.isDemoEditorial && (
                  <span className="rounded bg-zinc-800 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">Demo / Editorial — not verified</span>
                )}
              </div>
              <h1 className="mt-2 text-4xl font-black text-white">{creator.creatorProfile.displayName}</h1>
              <p className="text-sm text-zinc-500">@{creator.creatorProfile.handle}</p>
              <p className="mt-3 max-w-3xl text-zinc-300">{creator.creatorProfile.bio || creator.creatorProfile.tagline || 'No creator bio yet.'}</p>
              <div className="mt-5 flex flex-wrap items-center gap-5 text-sm font-bold text-zinc-500">
                <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {creator._count.followers} followers</span>
                <span>{creator._count.following} following</span>
                <span>{creator._count.reviews} reviews</span>
                <span>{creator._count.creatorPosts} posts</span>
              </div>
            </div>
            <CreatorFollowButton creatorId={creator.id} initialFollowing={following} />
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <section>
              <h2 className="mb-4 text-2xl font-black text-white">Creator Reviews</h2>
              <div className="space-y-4">
                {creator.reviews.map((review) => (
                  <Link key={review.id} href={'/reviews/' + review.id} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-purple-500/50">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Creator Review</span>
                        <h3 className="mt-1 text-xl font-black text-white">{review.title}</h3>
                        <p className="text-sm text-zinc-500">{review.game.title}</p>
                      </div>
                      <MetascoreBadge score={review.score} size="sm" />
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-zinc-400">{review.content}</p>
                  </Link>
                ))}
                {creator.reviews.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">No creator reviews yet.</div>}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-2xl font-black text-white">Creator Posts</h2>
              <div className="space-y-4">
                {creator.creatorPosts.map((post) => (
                  <article key={post.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Creator Post</span>
                      {post.isDemo && <span className="text-[10px] font-bold uppercase text-zinc-600">Demo Editorial</span>}
                    </div>
                    <h3 className="mt-2 text-xl font-black text-white">{post.title}</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">{post.content}</p>
                  </article>
                ))}
                {creator.creatorPosts.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">No creator posts yet.</div>}
              </div>
            </section>
          </div>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 h-fit">
            <h2 className="font-black text-white">Reputation & Reach</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Follower count is a discovery signal only. It does not increase, decrease, or directly modify any game score.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-zinc-950 p-4"><div className="text-2xl font-black text-white">{creator._count.followers}</div><div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Followers</div></div>
              <div className="rounded-xl bg-zinc-950 p-4"><div className="text-2xl font-black text-white">{creator._count.following}</div><div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Following</div></div>
              <div className="rounded-xl bg-zinc-950 p-4"><div className="text-2xl font-black text-white">{creator._count.reviews + creator._count.comments}</div><div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Participation</div></div>
              <div className="rounded-xl bg-zinc-950 p-4"><div className="text-2xl font-black text-white">{creator._count.creatorPosts}</div><div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Posts</div></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
