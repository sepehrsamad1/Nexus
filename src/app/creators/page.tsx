import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sortCreatorsForDiscovery } from '@/lib/creator';
import { CreatorFollowButton } from '@/components/creators/CreatorFollowButton';
import { Video, Users, ArrowRight } from 'lucide-react';

export default async function CreatorsPage() {
  const session = await getSession();
  const creators = await prisma.user.findMany({
    where: { role: 'STREAMER', creatorProfile: { isNot: null } },
    include: {
      creatorProfile: true,
      _count: { select: { followers: true, reviews: true, creatorPosts: true } },
    },
  });

  const sorted = sortCreatorsForDiscovery(
    creators.map((creator) => ({
      id: creator.id,
      displayName: creator.creatorProfile!.displayName,
      handle: creator.creatorProfile!.handle,
      followerCount: creator._count.followers,
      reviewCount: creator._count.reviews,
      creator,
    })),
  );

  const follows = session?.user
    ? await prisma.creatorFollow.findMany({
        where: { followerId: session.user.id, followingId: { in: sorted.map((item) => item.id) } },
        select: { followingId: true },
      })
    : [];
  const followingIds = new Set(follows.map((follow) => follow.followingId));

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-black text-white">Creator Discovery</h1>
          </div>
          <p className="mt-2 max-w-2xl text-zinc-400">
            Follow demo/editorial creators to personalize discovery. Follower count affects reach only — never a creator&apos;s game score.
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">No creators are available yet.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map(({ creator, followerCount, reviewCount }) => (
              <article key={creator.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={creator.image || '/media-fallback.svg'}
                    alt=""
                    className="h-14 w-14 rounded-full border border-zinc-700 bg-zinc-950 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link href={'/creators/' + creator.creatorProfile!.handle} className="font-black text-white hover:text-indigo-400">
                      {creator.creatorProfile!.displayName}
                    </Link>
                    <p className="text-xs text-zinc-500">@{creator.creatorProfile!.handle}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-zinc-400">{creator.creatorProfile!.tagline || creator.creatorProfile!.bio}</p>
                <div className="mt-5 flex items-center gap-4 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {followerCount} followers</span>
                  <span>{reviewCount} reviews</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <CreatorFollowButton creatorId={creator.id} initialFollowing={followingIds.has(creator.id)} />
                  <Link href={'/creators/' + creator.creatorProfile!.handle} className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
                    Profile <ArrowRight className="inline h-4 w-4" />
                  </Link>
                </div>
                {creator.creatorProfile!.isDemoEditorial && (
                  <p className="mt-4 border-t border-zinc-800 pt-3 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                    Demo / Editorial Creator — not verified public figure
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
