import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { ReviewCommerceSidebar } from '@/components/store/ReviewCommerceSidebar';
import { safeJsonParse } from '@/lib/utils';
import { PlayCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const game = await prisma.game.findUnique({
    where: { slug },
    include: { reviews: { include: { author: true }, orderBy: { upvotes: 'desc' } } }
  });

  if (!game) notFound();

  const streamers = game.reviews.filter(r => r.roleAtCreation === 'STREAMER');

  return (
    <main className="min-h-screen pb-20">
      <div className="relative h-[60vh] min-h-[500px] flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.coverImage} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent backdrop-blur-[2px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 flex justify-between items-end">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tight">{game.title}</h1>
            <div className="flex gap-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 p-4 rounded-2xl w-fit mt-6">
              <MetascoreBadge score={game.expertScore} label="Critics" size="sm" />
              <div className="w-px bg-zinc-700"></div>
              <MetascoreBadge score={game.streamerScore} label="Streamers" size="sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-8">
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
            <h2 className="text-3xl font-black text-white">Streamer VOD Reviews</h2>
            {session?.user && <ReviewModal gameId={game.id} gameTitle={game.title} userRole={session.user.role} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {streamers.map(review => (
              <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img src={review.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author.id}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-bold text-white">{review.author.name}</div>
                    <div className="text-xs text-purple-400 font-bold uppercase">Verified Streamer</div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{review.title}</h3>
                <MetascoreBadge score={review.score} size="sm" className="mb-4" />
                <Link href={`/reviews/${review.id}`} className="py-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" /> View Thread
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Store Cross-Sell inserted into Game Detail Page */}
        <aside className="w-full lg:w-80 shrink-0">
          <ReviewCommerceSidebar gameId={game.id} />
        </aside>

      </div>
    </main>
  );
}
