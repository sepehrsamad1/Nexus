import prisma from '@/lib/prisma';
import Link from 'next/link';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { MediaImage } from '@/components/MediaImage';
import { collectGameFacets, filterAndSortGames, SCORE_SOURCES, type GameSort, type ScoreSource } from '@/lib/discovery';
import { Search, SlidersHorizontal, Trophy } from 'lucide-react';

const validScoreSources: ScoreSource[] = ['expert', 'creator', 'user'];
const validSorts: GameSort[] = ['score-desc', 'title-asc', 'release-newest', 'release-oldest'];

function pick<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? value as T : fallback;
}

export default async function GamesDirectory({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const params = (await searchParams) ?? {};
  const get = (key: string) => typeof params[key] === 'string' ? params[key] as string : '';
  const query = get('q');
  const scoreSource = pick(get('score'), validScoreSources, 'expert');
  const sort = pick(get('sort'), validSorts, 'score-desc');
  const genre = get('genre');
  const platform = get('platform');

  const allGames = await prisma.game.findMany({ orderBy: { title: 'asc' } });
  const games = filterAndSortGames(allGames, { query, genre, platform, scoreSource, sort });
  const facets = collectGameFacets(allGames);
  const selectedScore = SCORE_SOURCES[scoreSource];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-black text-white flex items-center gap-3"><Trophy className="w-8 h-8 text-amber-400" /> Games Directory</h1>
            <p className="text-zinc-400 mt-2 text-lg">Search the catalog and rank games by the perspective you actually want to see.</p>
          </div>
          <div className="text-sm text-zinc-500">Showing <span className="text-white font-bold">{games.length}</span> of {allGames.length} games</div>
        </div>
      </div>

      <form method="get" className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input name="q" defaultValue={query} placeholder="Search games, genres, developers..." aria-label="Search games" className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500" />
          </label>
          <select name="score" defaultValue={scoreSource} aria-label="Score source" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white">
            <option value="expert">Expert score</option>
            <option value="creator">Creator score</option>
            <option value="user">User score</option>
          </select>
          <select name="sort" defaultValue={sort} aria-label="Game sort order" className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white">
            <option value="score-desc">Highest selected score</option>
            <option value="title-asc">Title A–Z</option>
            <option value="release-newest">Newest release</option>
            <option value="release-oldest">Oldest release</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 text-xs text-zinc-500">Genre
            <select name="genre" defaultValue={genre} className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200">
              <option value="">All genres</option>
              {facets.genres.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="flex-1 text-xs text-zinc-500">Platform
            <select name="platform" defaultValue={platform} className="mt-1 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-200">
              <option value="">All platforms</option>
              {facets.platforms.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500">Apply filters</button>
            <Link href="/games" className="px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-800">Reset</Link>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500"><SlidersHorizontal className="w-4 h-4" /> Ranking by <span className="text-indigo-400 font-bold">{selectedScore.label} score</span>; filters are preserved in the URL.</div>
      </form>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-12 text-center">
          <Search className="w-10 h-10 mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-white">No games match those filters</h2>
          <p className="text-zinc-500 mt-2">Try a different title, genre, platform, or score source.</p>
          <Link href="/games" className="inline-block mt-5 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 text-sm font-bold">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => {
            const score = game[selectedScore.field];
            const genres = JSON.parse(game.genresJson) as string[];
            const platforms = JSON.parse(game.platformsJson) as string[];
            return (
              <Link key={game.id} href={`/games/${game.slug}`} className="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-zinc-900 transition-all flex flex-col">
                <div className="h-48 relative overflow-hidden">
                  <MediaImage src={game.coverImage} alt={`${game.title} cover art`} fallbackLabel="Game artwork unavailable" className="group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <MetascoreBadge score={score} size="sm" />
                    <span className="text-[10px] uppercase font-black tracking-wide text-zinc-300 bg-zinc-950/80 border border-zinc-700 rounded px-2 py-1">{selectedScore.label}</span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">{game.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {genres.slice(0, 2).map(g => <span key={g} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300">{g}</span>)}
                    {platforms.slice(0, 2).map(p => <span key={p} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{p}</span>)}
                  </div>
                  <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-medium">
                    <div className="flex gap-4"><span>Expert {game.expertScore}</span><span>Creator {game.streamerScore}</span><span>User {game.userScore}</span></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
