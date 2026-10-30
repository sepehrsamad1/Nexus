import prisma from './prisma';

export const EXTERNAL_REFERENCE_KIND = {
  OFFICIAL_TRAILER: 'OFFICIAL_TRAILER',
  REDDIT_REFERENCE: 'REDDIT_REFERENCE',
} as const;

export type ExternalReferenceKind = typeof EXTERNAL_REFERENCE_KIND[keyof typeof EXTERNAL_REFERENCE_KIND];
export type TrailerConfig = { gameSlug: string; url: string };
export type RedditReferenceConfig = { gameSlug: string; url: string };

export type ExternalConfig = {
  enabled: boolean;
  cacheHours: number;
  youtubeTrailersEnabled: boolean;
  youtubeTrailers: TrailerConfig[];
  redditEnabled: boolean;
  redditReferences: RedditReferenceConfig[];
  redditAccessToken?: string;
};

export type ExternalSyncResult = {
  enabled: boolean;
  imported: number;
  refreshed: number;
  skipped: number;
  warnings: string[];
};

export type NormalizedExternalReference = {
  entityType: 'GAME';
  entityId: string;
  kind: ExternalReferenceKind;
  externalId: string | null;
  source: string;
  sourceUrl: string;
  canonicalUrl: string;
  title: string;
  excerpt?: string;
  authorDisplayName?: string;
  publishedAt?: Date;
  retrievedAt: Date;
  attribution: string;
  metadataJson: string;
  isDemoEditorial: boolean;
};

function parseBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function parseJsonArray<T>(value: string | undefined, fallback: T[] = []): T[] {
  if (!value?.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getExternalConfig(env: NodeJS.ProcessEnv = process.env): ExternalConfig {
  return {
    enabled: parseBoolean(env.NEXUS_EXTERNAL_INTEGRATIONS_ENABLED),
    cacheHours: Math.max(1, Number(env.NEXUS_EXTERNAL_CACHE_HOURS || 24) || 24),
    youtubeTrailersEnabled: parseBoolean(env.NEXUS_YOUTUBE_TRAILER_ADAPTER_ENABLED),
    youtubeTrailers: parseJsonArray<TrailerConfig>(env.NEXUS_YOUTUBE_TRAILER_URLS_JSON),
    redditEnabled: parseBoolean(env.NEXUS_REDDIT_ADAPTER_ENABLED),
    redditReferences: parseJsonArray<RedditReferenceConfig>(env.NEXUS_REDDIT_REFERENCE_URLS_JSON),
    redditAccessToken: env.REDDIT_ACCESS_TOKEN?.trim() || undefined,
  };
}

export function isFresh(retrievedAt: Date, cacheHours: number, now = new Date()) {
  return now.getTime() - retrievedAt.getTime() < cacheHours * 60 * 60 * 1000;
}

function publicUrl(input: string, allowedHosts: string[]) {
  const url = new URL(input);
  if (url.protocol !== 'https:') throw new Error('External sources must use HTTPS.');
  if (!allowedHosts.includes(url.hostname)) throw new Error(`External host is not allowed: ${url.hostname}`);
  return url;
}

function youtubeVideoId(url: URL) {
  if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const embed = url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/);
  return embed?.[1] || null;
}

export async function fetchPublicYoutubeTrailer(
  config: TrailerConfig,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<NormalizedExternalReference> {
  const sourceUrl = publicUrl(config.url, ['www.youtube.com', 'youtube.com', 'youtu.be']);
  const videoId = youtubeVideoId(sourceUrl);
  if (!videoId) throw new Error('Configured YouTube URL does not contain a supported video id.');

  const response = await fetcher(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl.toString())}&format=json`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) throw new Error(`YouTube metadata request failed with HTTP ${response.status}.`);
  const data = await response.json() as { title?: string; author_name?: string; author_url?: string; thumbnail_url?: string };

  return {
    entityType: 'GAME',
    entityId: '',
    kind: EXTERNAL_REFERENCE_KIND.OFFICIAL_TRAILER,
    externalId: videoId,
    source: 'YouTube public source',
    sourceUrl: sourceUrl.toString(),
    canonicalUrl: sourceUrl.toString(),
    title: data.title?.trim() || 'Public trailer reference',
    authorDisplayName: data.author_name?.trim() || undefined,
    retrievedAt: now,
    attribution: `Public YouTube source${data.author_name ? ` by ${data.author_name}` : ''}. Nexus stores metadata and links back to the hosted source; it does not re-host the video.`,
    metadataJson: JSON.stringify({ provider: 'youtube-oembed', authorUrl: data.author_url || null, thumbnailUrl: data.thumbnail_url || null, videoId }),
    isDemoEditorial: false,
  };
}

function redditPostId(url: URL) {
  const match = url.pathname.match(/\/comments\/([a-z0-9]+)/i);
  return match?.[1] || null;
}

export async function fetchPublicRedditReference(
  config: RedditReferenceConfig,
  accessToken: string,
  fetcher: typeof fetch = fetch,
  now = new Date(),
): Promise<NormalizedExternalReference> {
  const sourceUrl = publicUrl(config.url, ['www.reddit.com', 'reddit.com']);
  const postId = redditPostId(sourceUrl);
  if (!postId) throw new Error('Configured Reddit URL must point to a specific post.');

  const response = await fetcher(`https://oauth.reddit.com/comments/${postId}.json?raw_json=1`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}`, 'User-Agent': 'Nexus external reference reader/1.0' },
  });
  if (!response.ok) throw new Error(`Reddit metadata request failed with HTTP ${response.status}.`);

  const payload = await response.json() as Array<{ data?: { children?: Array<{ data?: Record<string, unknown> }> } }>;
  const post = payload[0]?.data?.children?.[0]?.data;
  if (!post) throw new Error('Reddit response did not contain a public post.');

  const permalink = typeof post.permalink === 'string' ? `https://www.reddit.com${post.permalink}` : sourceUrl.toString();
  const subreddit = typeof post.subreddit_name_prefixed === 'string' ? post.subreddit_name_prefixed : 'Reddit';
  const title = typeof post.title === 'string' ? post.title.trim() : 'Public Reddit reference';
  const author = typeof post.author === 'string' ? post.author.trim() : undefined;
  const publishedAt = typeof post.created_utc === 'number' ? new Date(post.created_utc * 1000) : undefined;

  return {
    entityType: 'GAME',
    entityId: '',
    kind: EXTERNAL_REFERENCE_KIND.REDDIT_REFERENCE,
    externalId: postId,
    source: 'Reddit public reference',
    sourceUrl: sourceUrl.toString(),
    canonicalUrl: permalink,
    title,
    excerpt: typeof post.selftext === 'string' ? post.selftext.slice(0, 280).trim() : undefined,
    authorDisplayName: author,
    publishedAt,
    retrievedAt: now,
    attribution: `${subreddit} public post. Author identity remains external to Nexus; Nexus does not impersonate or create an account for this author.`,
    metadataJson: JSON.stringify({ provider: 'reddit-data-api', subreddit, score: typeof post.score === 'number' ? post.score : null, commentCount: typeof post.num_comments === 'number' ? post.num_comments : null }),
    isDemoEditorial: false,
  };
}

async function saveReference(reference: NormalizedExternalReference, cacheHours: number) {
  const existing = await prisma.externalReference.findFirst({
    where: { source: reference.source, entityId: reference.entityId, sourceUrl: reference.sourceUrl },
  });

  if (existing && isFresh(existing.retrievedAt, cacheHours)) return { imported: false, refreshed: false, skipped: true };

  if (existing) {
    await prisma.externalReference.update({ where: { id: existing.id }, data: reference });
    return { imported: false, refreshed: true, skipped: false };
  }

  await prisma.externalReference.create({ data: reference });
  return { imported: true, refreshed: false, skipped: false };
}

export async function syncExternalReferences(config = getExternalConfig()): Promise<ExternalSyncResult> {
  if (!config.enabled) return { enabled: false, imported: 0, refreshed: 0, skipped: 0, warnings: ['External integrations are disabled.'] };

  const result: ExternalSyncResult = { enabled: true, imported: 0, refreshed: 0, skipped: 0, warnings: [] };
  const games = await prisma.game.findMany({ select: { id: true, slug: true } });
  const gamesBySlug = new Map(games.map(game => [game.slug, game]));

  if (config.youtubeTrailersEnabled) {
    for (const item of config.youtubeTrailers.slice(0, 20)) {
      const game = gamesBySlug.get(item.gameSlug);
      if (!game) { result.warnings.push(`YouTube config references unknown game slug: ${item.gameSlug}`); continue; }
      try {
        const reference = await fetchPublicYoutubeTrailer(item);
        reference.entityId = game.id;
        const saved = await saveReference(reference, config.cacheHours);
        result.imported += Number(saved.imported); result.refreshed += Number(saved.refreshed); result.skipped += Number(saved.skipped);
      } catch (error) {
        result.warnings.push(`YouTube ${item.gameSlug}: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    }
  }

  if (config.redditEnabled) {
    if (!config.redditAccessToken) {
      result.warnings.push('Reddit adapter is enabled but REDDIT_ACCESS_TOKEN is not configured; no live Reddit requests were made.');
    } else {
      for (const item of config.redditReferences.slice(0, 20)) {
        const game = gamesBySlug.get(item.gameSlug);
        if (!game) { result.warnings.push(`Reddit config references unknown game slug: ${item.gameSlug}`); continue; }
        try {
          const reference = await fetchPublicRedditReference(item, config.redditAccessToken);
          reference.entityId = game.id;
          const saved = await saveReference(reference, config.cacheHours);
          result.imported += Number(saved.imported); result.refreshed += Number(saved.refreshed); result.skipped += Number(saved.skipped);
        } catch (error) {
          result.warnings.push(`Reddit ${item.gameSlug}: ${error instanceof Error ? error.message : 'unknown error'}`);
        }
      }
    }
  }

  return result;
}
