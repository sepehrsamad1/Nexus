import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { safeJsonParse } from '@/lib/utils';
import { Trophy, Filter } from 'lucide-react';

export default async function GamesDirectory() {
  const games = await prisma.game.findMany({
    orderBy: { expertScore: 'desc' }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" /> Games Directory
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Browse games sorted by Expert Metascore.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-2">
          <Filter className="w-5 h-5 text-zinc-400 ml-2" />
          <select className="bg-transparent text-white border-none focus:ring-0 text-sm font-medium pr-8 outline-none">
            <option value="expert">Sort by: Expert Score</option>
            <option value="streamer">Sort by: Streamer Score</option>
            <option value="user">Sort by: User Score</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => {
          const platforms = safeJsonParse<string[]>(game.platformsJson, []);
          const genres = safeJsonParse<string[]>(game.genresJson, []);
          
          return (
            <Link key={game.id} href={`/games/${game.slug}`} className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-zinc-900 transition-all flex flex-col">
              <div className="h-48 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <MetascoreBadge score={game.expertScore} size="sm" />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">{game.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {genres.slice(0,2).map(g => (
                    <span key={g} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300">{g}</span>
                  ))}
                  {platforms.slice(0,2).map(p => (
                    <span key={p} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{p}</span>
                  ))}
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">📺 {game.streamerScore || '--'} Streamer</span>
                    <span className="flex items-center gap-1">🎮 {game.userScore || '--'} User</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
