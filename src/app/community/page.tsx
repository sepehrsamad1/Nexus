import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { VotingArrows } from '@/components/discussion/VotingArrows';
import { Users, Flame, MessageSquare } from 'lucide-react';

export default async function CommunityFrontPage() {
  // Fetch top reviews acting as "Threads"
  const threads = await prisma.review.findMany({
    orderBy: { upvotes: 'desc' },
    take: 20,
    include: {
      game: true,
      author: true,
      _count: {
        select: { comments: true }
      }
    }
  });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-amber-400" /> Community Debates
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Top discussions happening around Streamer and Expert reviews.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-700 transition">
            <Flame className="w-4 h-4 text-amber-500" /> Hot
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {threads.map(thread => (
          <Link href={`/reviews/${thread.id}`} key={thread.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 hover:border-indigo-500/50 transition-colors group">
            {/* Thread Karma (Static view for front page) */}
            <div className="w-12 flex flex-col items-center bg-zinc-950/50 rounded-lg p-2 shrink-0">
              <span className="text-amber-500 font-black mb-1">↑</span>
              <span className="font-mono text-sm font-bold text-zinc-300">{thread.upvotes - thread.downvotes}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
                <span className={`font-bold ${thread.roleAtCreation === 'STREAMER' ? 'text-purple-400' : thread.roleAtCreation === 'EXPERT' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                  {thread.author.name}
                </span>
                <span>reviewed</span>
                <span className="font-bold text-zinc-300">{thread.game.title}</span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{thread.title}</h2>
              <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{thread.content}</p>
              
              <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {thread._count.comments} Comments</span>
                {thread.videoUrl && <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">VOD Included</span>}
              </div>
            </div>

            {/* Metascore Context */}
            <div className="hidden sm:block shrink-0 pt-2 pr-2">
              <MetascoreBadge score={thread.score} size="sm" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
