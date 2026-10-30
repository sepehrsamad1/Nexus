import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { ReviewModal } from '@/components/reviews/ReviewModal';
import { RootCommentForm } from '@/components/discussion/RootCommentForm';
import { CommentTree } from '@/components/discussion/CommentTree';
import { ReviewCommerceSidebar } from '@/components/store/ReviewCommerceSidebar';
import { MediaImage } from '@/components/MediaImage';
import { safeJsonParse } from '@/lib/utils';
import {
  CalendarDays,
  Gamepad2,
  MessageSquare,
  PlayCircle,
  ShoppingBag,
  Users,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const roleMeta = {
  EXPERT: { label: 'Expert', accent: 'text-emerald-400', badge: 'Expert Review' },
  STREAMER: { label: 'Creator', accent: 'text-purple-400', badge: 'Creator Review' },
  USER: { label: 'Player', accent: 'text-sky-400', badge: 'Player Review' },
} as const;

function formatReleaseDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function scoreBar(score: number) {
  return Math.max(0, Math.min(100, score));
}

function buildCommentTree(flatComments: any[]) {
  const nodes = new Map(flatComments.map(comment => [comment.id, { ...comment, replies: [] as any[] }]));
  const roots: any[] = [];
  for (const comment of flatComments) {
    const node = nodes.get(comment.id);
    if (!node) continue;
    if (comment.parentId) {
      const parent = nodes.get(comment.parentId);
      if (parent) parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export default async function GameDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();

  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { author: true },
        orderBy: [{ roleAtCreation: 'asc' }, { upvotes: 'desc' }],
      },
    },
  });

  if (!game) notFound();

  const [media, externalReferences, discussionComments, relatedCandidates, relatedProducts] = await Promise.all([
    prisma.mediaAsset.findMany({
      where: { entityType: 'GAME', entityId: game.id },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.externalReference.findMany({
      where: { entityType: 'GAME', entityId: game.id },
      orderBy: [{ kind: 'asc' }, { retrievedAt: 'desc' }],
      take: 12,
    }),
    prisma.comment.findMany({
      where: { gameId: game.id, reviewId: null, isDeleted: false },
      include: { author: true },
      orderBy: { createdAt: 'asc' },
      take: 200,
    }),
    prisma.game.findMany({
      where: { id: { not: game.id } },
      select: {
        id: true,
        slug: true,
        title: true,
        coverImage: true,
        expertScore: true,
        genresJson: true,
      },
      take: 12,
    }),
    prisma.product.findMany({
      where: { relatedGameId: game.id },
      orderBy: { stock: 'desc' },
      take: 4,
    }),
  ]);

  const platforms = safeJsonParse<string[]>(game.platformsJson, []);
  const genres = safeJsonParse<string[]>(game.genresJson, []);
  const hero = media.find(asset => asset.kind === 'HERO') || media.find(asset => asset.kind === 'COVER');
  const cover = media.find(asset => asset.kind === 'COVER');
  const gallery = media.filter(asset => asset.kind === 'GALLERY');
  const trailer = media.find(asset => asset.kind === 'TRAILER_THUMBNAIL');

  const relatedGames = relatedCandidates
    .map(candidate => {
      const candidateGenres = safeJsonParse<string[]>(candidate.genresJson, []);
      const overlap = candidateGenres.filter(genre => genres.includes(genre)).length;
      return { ...candidate, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap || b.expertScore - a.expertScore)
    .slice(0, 4);

  const fallbackProducts = relatedProducts.length > 0
    ? relatedProducts
    : await prisma.product.findMany({ orderBy: { stock: 'desc' }, take: 4 });

  const discussionVoteRows = session?.user
    ? await prisma.vote.findMany({
        where: { userId: session.user.id, commentId: { in: discussionComments.map(comment => comment.id) } },
        select: { commentId: true, value: true },
      })
    : [];
  const discussionVoteMap = new Map(discussionVoteRows.map(vote => [vote.commentId, vote.value as 1 | -1]));
  const commentTree = buildCommentTree(discussionComments).map(root => ({
    ...root,
    initialUserVote: discussionVoteMap.get(root.id) ?? 0,
  }));
  for (const root of commentTree) {
    const stack = [...root.replies];
    while (stack.length) {
      const node = stack.pop();
      node.initialUserVote = discussionVoteMap.get(node.id) ?? 0;
      stack.push(...(node.replies || []));
    }
  }

  const reviewsByRole = {
    EXPERT: game.reviews.find(review => review.roleAtCreation === 'EXPERT'),
    STREAMER: game.reviews.find(review => review.roleAtCreation === 'STREAMER'),
    USER: game.reviews.find(review => review.roleAtCreation === 'USER'),
  };

  const scoreRows = [
    { label: 'Expert', score: game.expertScore, count: game.reviews.filter(review => review.roleAtCreation === 'EXPERT').length, tone: 'emerald' },
    { label: 'Creator', score: game.streamerScore, count: game.reviews.filter(review => review.roleAtCreation === 'STREAMER').length, tone: 'purple' },
    { label: 'Player', score: game.userScore, count: game.reviews.filter(review => review.roleAtCreation === 'USER').length, tone: 'sky' },
  ] as const;

  return (
    <main className="min-h-screen pb-20">
      <section className="relative isolate overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 -z-20 bg-zinc-950" />
        <MediaImage
          src={hero?.url || game.bannerImage || game.coverImage}
          alt={hero?.altText || `${game.title} hero artwork`}
          fallbackLabel="Hero artwork unavailable"
          priority
          className="absolute inset-0 -z-10 opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row gap-8 lg:items-end">
            <div className="w-40 sm:w-48 shrink-0">
              <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
                <MediaImage
                  src={cover?.url || game.coverImage}
                  alt={cover?.altText || `${game.title} cover art`}
                  fallbackLabel="Cover unavailable"
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.slice(0, 4).map(genre => (
                  <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-200">{genre}</span>
                ))}
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white">{game.title}</h1>
              <p className="mt-4 max-w-3xl text-base sm:text-lg leading-relaxed text-zinc-300">{game.description}</p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-zinc-300">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-400" /> {formatReleaseDate(game.releaseDate)}</span>
                <span className="flex items-center gap-2"><Gamepad2 className="h-4 w-4 text-indigo-400" /> {game.developer}</span>
                <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-indigo-400" /> {game.publisher}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {platforms.map(platform => (
                  <span key={platform} className="rounded-md bg-zinc-900/80 px-2.5 py-1 text-xs font-bold text-zinc-300 ring-1 ring-inset ring-zinc-700">{platform}</span>
                ))}
              </div>
            </div>

            <div className="shrink-0 rounded-2xl border border-zinc-700 bg-zinc-950/85 p-5 backdrop-blur-md">
              {game.reviewCount > 0 ? (
                <MetascoreBadge score={game.overallScore} label="Nexus Score" size="lg" />
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-700 px-5 py-4 text-center">
                  <div className="text-3xl font-black text-zinc-500">—</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">Not rated</div>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs">
                <div><div className="text-lg font-black text-white">{game.reviewCount}</div><div className="text-zinc-500">Reviews</div></div>
                <div><div className="text-lg font-black text-white">{game.discussionCount}</div><div className="text-zinc-500">Discussion</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-8">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="score-breakdown">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 id="score-breakdown" className="text-2xl font-black text-white">Score Breakdown</h2>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Transparent aggregate</span>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500">
                Each source is the average of its submitted reviews. The Overall Score uses 45% Expert, 30% Creator,
                and 25% Player weight, with missing sources omitted and the remaining weights renormalized.
              </p>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {scoreRows.map(({ label, score, count, tone }) => (
                  <div key={label} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-white">{label}</span>
                      <span className="font-mono text-xl font-black text-white">{count > 0 ? score : '—'}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      {count > 0 && (
                        <div
                          className={`h-full rounded-full ${tone === 'emerald' ? 'bg-emerald-400' : tone === 'purple' ? 'bg-purple-400' : 'bg-sky-400'}`}
                          style={{ width: `${scoreBar(score)}%` }}
                        />
                      )}
                    </div>
                    <div className="mt-3 text-xs text-zinc-500">
                      {count > 0 ? `${count} review${count === 1 ? '' : 's'}` : 'No reviews yet'}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="game-media">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 id="game-media" className="text-2xl font-black text-white">Media & Trailer</h2>
                {trailer?.sourceUrl && (
                  <a href={trailer.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">Open source</a>
                )}
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {trailer ? (
                  <a href={trailer.sourceUrl || trailer.url} target="_blank" rel="noreferrer" className="group relative aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                    <MediaImage src={trailer.url} alt={trailer.altText || `${game.title} trailer preview`} fallbackLabel="Trailer preview unavailable" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl"><PlayCircle className="h-7 w-7" /></span>
                    </div>
                    <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white">Trailer preview</span>
                  </a>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center text-sm text-zinc-500">No trailer reference is available for this game yet.</div>
                )}
                {(gallery.length > 0 ? gallery : [hero]).filter(Boolean).slice(0, 3).map(asset => (
                  <div key={asset!.id} className="aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
                    <MediaImage src={asset!.url} alt={asset!.altText || `${game.title} gallery artwork`} fallbackLabel="Gallery artwork unavailable" />
                  </div>
                ))}
              </div>
            </section>

            {externalReferences.length > 0 && (
              <section aria-labelledby="external-references">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <h2 id="external-references" className="text-2xl font-black text-white">Public Source References</h2>
                    <p className="mt-1 text-sm text-zinc-500">Optional external references with source attribution and retrieval metadata.</p>
                  </div>
                  <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-500">Read-only</span>
                </div>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {externalReferences.map(reference => (
                    <article key={reference.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          {reference.kind === 'OFFICIAL_TRAILER' ? 'Trailer' : 'Community'}
                        </span>
                        {reference.isDemoEditorial && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300">Nexus Demo</span>
                        )}
                      </div>
                      <h3 className="mt-3 font-bold text-white">{reference.title}</h3>
                      {reference.excerpt && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{reference.excerpt}</p>}
                      <div className="mt-4 space-y-1 text-xs text-zinc-500">
                        <div>Source: <span className="text-zinc-300">{reference.source}</span></div>
                        {reference.authorDisplayName && <div>External author: <span className="text-zinc-300">{reference.authorDisplayName}</span> (not a Nexus account)</div>}
                        <div>Retrieved: <span className="text-zinc-300">{reference.retrievedAt.toISOString()}</span></div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-zinc-500">{reference.attribution}</p>
                      <a href={reference.canonicalUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-bold text-indigo-400 hover:text-indigo-300">
                        Open original source <ArrowRight className="ml-1 h-4 w-4" />
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="reviews">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h2 id="reviews" className="text-2xl font-black text-white">Reviews</h2>
                  <p className="text-sm text-zinc-500 mt-1">Expert, creator, and player perspectives.</p>
                </div>
                {session?.user && <ReviewModal gameId={game.id} gameTitle={game.title} userRole={session.user.role} />}
              </div>
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['EXPERT', 'STREAMER', 'USER'] as const).map(role => {
                  const review = reviewsByRole[role];
                  const meta = roleMeta[role];
                  if (!review) {
                    return <div key={role} className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-5 text-sm text-zinc-500">No {meta.label.toLowerCase()} review yet.</div>;
                  }
                  return (
                    <article key={review.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${meta.accent}`}>{meta.badge}</span>
                          <div className="mt-1 truncate font-bold text-white">{review.author.name}</div>
                        </div>
                        <MetascoreBadge score={review.score} size="sm" />
                      </div>
                      <h3 className="font-bold text-white line-clamp-2">{review.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400 line-clamp-4">{review.content}</p>
                      <Link href={`/reviews/${review.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300">Read review <ArrowRight className="h-4 w-4" /></Link>
                    </article>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="community">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h2 id="community" className="text-2xl font-black text-white">Community Discussion</h2>
                  <p className="text-sm text-zinc-500 mt-1">{game.discussionCount} community comments, with nested replies and voting.</p>
                </div>
                <Link href="/community" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">Community <ArrowRight className="inline h-4 w-4" /></Link>
              </div>
              {session?.user && <div className="mt-5"><RootCommentForm gameId={game.id} /></div>}
              <div className="mt-5">
                {commentTree.length > 0 ? (
                  <CommentTree comments={commentTree} gameId={game.id} />
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-zinc-700" />
                    <p className="mt-3 text-sm font-bold text-white">No game discussion yet</p>
                    <p className="mt-1 text-sm text-zinc-500">Start the first respectful thread for {game.title}.</p>
                  </div>
                )}
              </div>
            </section>

            <section aria-labelledby="related-games">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h2 id="related-games" className="text-2xl font-black text-white">Related Games</h2>
              </div>
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedGames.map(related => (
                  <Link key={related.id} href={`/games/${related.slug}`} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                    <div className="aspect-[2/3]"><MediaImage src={related.coverImage} alt={`${related.title} cover art`} fallbackLabel="Cover unavailable" /></div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-indigo-400">{related.title}</h3>
                      <div className="mt-2 text-xs font-bold text-zinc-500">{related.expertScore} Expert</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <ReviewCommerceSidebar gameId={game.id} />
              <section aria-labelledby="gear" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="h-4 w-4 text-indigo-400" />
                  <h2 id="gear" className="font-black text-white">Related Gaming Gear</h2>
                </div>
                <div className="space-y-3">
                  {fallbackProducts.map(product => {
                    const images = safeJsonParse<string[]>(product.imagesJson, []);
                    return (
                      <Link key={product.id} href={`/store/${product.slug}`} className="flex gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3 hover:border-indigo-500/50">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                          <MediaImage src={images[0]} alt={`${product.name} product image`} fallbackLabel="Gear image unavailable" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-bold text-white">{product.name}</h3>
                          <p className="mt-1 font-mono text-sm text-indigo-400">${product.price.toFixed(2)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
