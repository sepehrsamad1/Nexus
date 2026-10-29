import { safeJsonParse } from '@/lib/utils';

export type ScoreSource = 'expert' | 'creator' | 'user';
export type GameSort = 'score-desc' | 'title-asc' | 'release-newest' | 'release-oldest';

export const SCORE_SOURCES: Record<ScoreSource, { label: string; field: 'expertScore' | 'streamerScore' | 'userScore' }> = {
  expert: { label: 'Expert', field: 'expertScore' },
  creator: { label: 'Creator', field: 'streamerScore' },
  user: { label: 'User', field: 'userScore' },
};

export function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function gameMatchesQuery(game: { title: string; description: string; developer: string; publisher: string; genresJson: string; platformsJson: string }, query: string) {
  const q = normalizeSearch(query);
  if (!q) return true;
  const genres = safeJsonParse<string[]>(game.genresJson, []);
  const platforms = safeJsonParse<string[]>(game.platformsJson, []);
  return [game.title, game.description, game.developer, game.publisher, ...genres, ...platforms]
    .some(value => normalizeSearch(value).includes(q));
}

export function productMatchesQuery(product: { name: string; description: string; brand: string; category: string; slug: string }, query: string) {
  const q = normalizeSearch(query);
  if (!q) return true;
  return [product.name, product.description, product.brand, product.category, product.slug]
    .some(value => normalizeSearch(value).includes(q));
}

export function filterAndSortGames<T extends {
  title: string;
  description: string;
  developer: string;
  publisher: string;
  genresJson: string;
  platformsJson: string;
  expertScore: number;
  streamerScore: number;
  userScore: number;
  releaseDate: Date;
}>(games: T[], options: { query?: string; genre?: string; platform?: string; scoreSource?: ScoreSource; sort?: GameSort }) {
  const query = options.query ?? '';
  const genre = normalizeSearch(options.genre ?? '');
  const platform = normalizeSearch(options.platform ?? '');
  const scoreSource = options.scoreSource ?? 'expert';
  const sort = options.sort ?? 'score-desc';
  const filtered = games.filter(game => {
    const genres = safeJsonParse<string[]>(game.genresJson, []);
    const platforms = safeJsonParse<string[]>(game.platformsJson, []);
    const matchesGenre = !genre || genres.some(value => normalizeSearch(value) === genre);
    const matchesPlatform = !platform || platforms.some(value => normalizeSearch(value) === platform);
    return matchesGenre && matchesPlatform && gameMatchesQuery(game, query);
  });
  const scoreField = SCORE_SOURCES[scoreSource].field;
  return filtered.sort((a, b) => {
    if (sort === 'title-asc') return a.title.localeCompare(b.title);
    if (sort === 'release-newest') return b.releaseDate.getTime() - a.releaseDate.getTime();
    if (sort === 'release-oldest') return a.releaseDate.getTime() - b.releaseDate.getTime();
    return b[scoreField] - a[scoreField] || a.title.localeCompare(b.title);
  });
}

export function collectGameFacets(games: Array<{ genresJson: string; platformsJson: string }>) {
  const genres = new Set<string>();
  const platforms = new Set<string>();
  for (const game of games) {
    safeJsonParse<string[]>(game.genresJson, []).forEach(value => genres.add(value));
    safeJsonParse<string[]>(game.platformsJson, []).forEach(value => platforms.add(value));
  }
  return { genres: [...genres].sort(), platforms: [...platforms].sort() };
}
