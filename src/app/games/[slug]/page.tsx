import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { safeJsonParse } from '@/lib/utils';
import { PlayCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const user = session?.user;

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { author: true },
        orderBy: { upvotes: 'desc' }
      }
    }
  });

  if (!game) notFound();

  const experts = game.reviews.filter(r => r.roleAtCreation === 'EXPERT');
  const streamers = game.reviews.filter(r => r.roleAtCreation === 'STREAMER');
  const users = game.reviews.filter(r => r.roleAtCreation === 'USER');

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="relative h-[60vh] min-h-[500px] flex items-end">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.coverImage} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent backdrop-blur-[2px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="max-w-3xl">
              <div className="flex gap-2 mb-4">
                {safeJsonParse<string[]>(game.genresJson, []).map(g => (
                  <span key={g} className="px-3 py-1 rounded-full text-xs uppercase font-bold bg-zinc-800 text-zinc-300">{g}</span>
                ))}
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tight">{game.title}</h1>
              <p className="text-xl text-zinc-300 mb-6 max-w-2xl">{game.description}</p>
              <div className="text-sm text-zinc-400 font-medium">
                Developed by <span className="text-white">{game.developer}</span> • Published by <span className="text-white">{game.publisher}</span>
              </div>
            </div>

            {/* 3-Column Score Breakdown */}
            <div className="flex flex-row gap-6 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 p-6 rounded-2xl shadow-2xl">
              <MetascoreBadge score={game.expertScore} label="Critics" size="md" />
              <div className="w-px bg-zinc-700"></div>
              <MetascoreBadge score={game.streamerScore} label="Streamers" size="md" />
              <div className="w-px bg-zinc-700"></div>
              <MetascoreBadge score={game.userScore} label="Users" size="md" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-6">
          <h2 className="text-3xl font-black text-white">Streamer VOD Reviews</h2>
          {user && <ReviewModal gameId={game.id} gameTitle={game.title} userRole={user.role} />}
        </div>

        {/* Streamer Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {streamers.length === 0 ? (
            <p className="text-zinc-500 italic">No streamer reviews yet.</p>
          ) : streamers.map(review => (
            <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
              {review.videoUrl && (
                <div className="relative aspect-video bg-zinc-950 flex items-center justify-center border-b border-zinc-800 group">
                  {/* Using a placeholder since actual iframe embeds need sanitized URLs */}
                  <img src={game.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="VOD Thumbnail" />
                  <div className="relative z-10 w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/30">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <MetascoreBadge score={review.score} size="sm" />
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={review.author.image || "https://api.dicebear.com/7.x/avataaars/svg?seed="+review.author.id} alt="Avatar" className="w-10 h-10 rounded-full bg-zinc-800" />
                    <div>
                      <div className="font-bold text-white">{review.author.name}</div>
                      <div className="text-xs text-purple-400 font-bold uppercase">Verified Streamer</div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{review.title}</h3>
                <p className="text-zinc-400 text-sm line-clamp-3 mb-6">{review.content}</p>
                
                <div className="flex gap-4">
                  <Link href={`/reviews/${review.id}`} className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4 text-amber-400" /> Discuss Review (Reddit Thread)
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Written Expert & User Reviews (Simple List) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Expert Critiques
            </h3>
            <div className="space-y-6">
              {experts.length === 0 && <p className="text-zinc-500">No expert reviews.</p>}
              {experts.map(review => (
                <div key={review.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-emerald-400">{review.author.name}</div>
                    </div>
                    <MetascoreBadge score={review.score} size="sm" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{review.title}</h4>
                  <p className="text-sm text-zinc-400">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-500"></span> Community Reviews
            </h3>
            <div className="space-y-6">
              {users.length === 0 && <p className="text-zinc-500">No user reviews.</p>}
              {users.map(review => (
                <div key={review.id} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-zinc-300">{review.author.name}</div>
                    </div>
                    <MetascoreBadge score={review.score} size="sm" />
                  </div>
                  <h4 className="font-bold text-white mb-2">{review.title}</h4>
                  <p className="text-sm text-zinc-400 line-clamp-3">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
