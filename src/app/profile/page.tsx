import Link from 'next/link';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ProfileSavedSummary } from '@/components/profile/ProfileSavedSummary';
import { MediaImage } from '@/components/MediaImage';
import { UserRound, Star, MessageSquare, Users, ShoppingBag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { reviews: true, comments: true, followers: true, following: true, creatorPosts: true, orders: true } },
      reviews: { select: { score: true }, orderBy: { createdAt: 'desc' }, take: 100 },
    },
  });

  if (!user) return null;

  const averageReview = user.reviews.length
    ? Math.round((user.reviews.reduce((sum, review) => sum + review.score, 0) / user.reviews.length) * 10) / 10
    : null;

  const roleLabel = user.role === 'ADMIN' ? 'Admin' : user.role === 'EXPERT' ? 'Expert' : user.role === 'STREAMER' ? 'Creator' : 'Player';

  const profileStats: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'Followers', value: user._count.followers, Icon: Users },
    { label: 'Following', value: user._count.following, Icon: Users },
    { label: 'Reviews', value: user._count.reviews, Icon: Star },
    { label: 'Comments', value: user._count.comments, Icon: MessageSquare },
    { label: 'Orders', value: user._count.orders, Icon: ShoppingBag },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="h-24 w-24 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950"><MediaImage src={user.image || '/media-fallback.svg'} alt="" fallbackLabel="Profile image unavailable" className="object-cover" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <UserRound className="h-5 w-5 text-indigo-400" />
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Your Profile</span>
                <span className="rounded bg-zinc-800 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">{roleLabel}</span>
              </div>
              <h1 className="mt-2 text-4xl font-black text-white">{user.name}</h1>
              <p className="mt-3 max-w-2xl text-zinc-300">{user.bio || 'No bio added yet.'}</p>
              <p className="mt-3 text-xs text-zinc-600">Private account details such as email and internal identifiers are not displayed here.</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {profileStats.map(({ label, value, Icon }) => (
              <div key={String(label)} className="rounded-2xl bg-zinc-950 p-4">
                <Icon className="h-4 w-4 text-zinc-500" />
                <div className="mt-2 text-2xl font-black text-white">{value}</div>
                <div className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white">Your Activity</h2>
                <Link href="/community" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Community</Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <Star className="h-5 w-5 text-amber-400" />
                  <h3 className="mt-3 font-black text-white">Reviews</h3>
                  <p className="mt-1 text-sm text-zinc-500">{user._count.reviews ? user._count.reviews + ' review' + (user._count.reviews === 1 ? '' : 's') + ' published.' : 'You have not published a review yet.'}</p>
                  {averageReview !== null && <p className="mt-3 text-xs font-bold text-zinc-400">Average review score: {averageReview}/100</p>}
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  <h3 className="mt-3 font-black text-white">Community participation</h3>
                  <p className="mt-1 text-sm text-zinc-500">{user._count.comments ? user._count.comments + ' comment' + (user._count.comments === 1 ? '' : 's') + ' in the community.' : 'No comments yet. Join a game discussion when you are ready.'}</p>
                </div>
              </div>
            </section>
            <ProfileSavedSummary />
          </div>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-black text-white">Reputation</h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">Nexus reputation is based on visible participation, not hidden account identifiers. Follower counts are social/discovery signals and never modify game scores.</p>
            <div className="mt-5 rounded-xl bg-zinc-950 p-4">
              <div className="text-2xl font-black text-white">{user._count.reviews + user._count.comments}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-600">Reviews + comments</div>
            </div>
            <Link href="/profile/orders" className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 px-4 py-3 text-sm font-black text-zinc-200 hover:bg-zinc-800">Order history</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
