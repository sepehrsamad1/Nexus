import prisma from './prisma';

export type ScoringRole = 'EXPERT' | 'STREAMER' | 'USER';

export type ScoreReview = {
  score: number;
  roleAtCreation: string;
};

export type ScoreSource = 'expert' | 'creator' | 'player';

export type ScoreBreakdown = {
  expertScore: number | null;
  creatorScore: number | null;
  playerScore: number | null;
  overallScore: number | null;
  expertCount: number;
  creatorCount: number;
  playerCount: number;
  totalCount: number;
};

/**
 * Nexus scoring rules:
 * - Expert Score = arithmetic mean of EXPERT review scores.
 * - Creator Score = arithmetic mean of STREAMER review scores.
 * - Player Score = arithmetic mean of USER review scores.
 * - Overall Score = weighted mean using 45% expert, 30% creator, 25% player.
 *
 * When a source has no reviews, that source contributes no weight to Overall Score;
 * the remaining weights are renormalized. This prevents missing data from becoming
 * an accidental zero that drags down the aggregate.
 *
 * A stored score of 0 remains the schema-compatible sentinel for "no source score".
 * Presentation code must use the corresponding review count to distinguish that
 * state from a real zero score.
 *
 * Creator follower counts are intentionally not part of this calculation.
 */
const SOURCE_WEIGHTS: Record<ScoreSource, number> = {
  expert: 0.45,
  creator: 0.30,
  player: 0.25,
};

function sanitizeScore(value: number): number | null {
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, value));
}

function averageScore(reviews: ScoreReview[]): number | null {
  if (reviews.length === 0) return null;

  const scores = reviews
    .map(review => sanitizeScore(review.score))
    .filter((score): score is number => score !== null);

  if (scores.length === 0) return null;

  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
}

export function calculateScoreBreakdown(reviews: ScoreReview[]): ScoreBreakdown {
  const experts = reviews.filter(review => review.roleAtCreation === 'EXPERT');
  const creators = reviews.filter(review => review.roleAtCreation === 'STREAMER');
  const players = reviews.filter(review => review.roleAtCreation === 'USER');

  const expertScore = averageScore(experts);
  const creatorScore = averageScore(creators);
  const playerScore = averageScore(players);

  const availableSources: Array<{ score: number; weight: number }> = [
    expertScore === null ? null : { score: expertScore, weight: SOURCE_WEIGHTS.expert },
    creatorScore === null ? null : { score: creatorScore, weight: SOURCE_WEIGHTS.creator },
    playerScore === null ? null : { score: playerScore, weight: SOURCE_WEIGHTS.player },
  ].filter((source): source is { score: number; weight: number } => source !== null);

  const totalWeight = availableSources.reduce((sum, source) => sum + source.weight, 0);
  const overallScore = totalWeight === 0
    ? null
    : Math.round(
        (availableSources.reduce((sum, source) => sum + source.score * source.weight, 0) / totalWeight) * 10
      ) / 10;

  return {
    expertScore,
    creatorScore,
    playerScore,
    overallScore,
    expertCount: experts.length,
    creatorCount: creators.length,
    playerCount: players.length,
    totalCount: reviews.length,
  };
}

export async function recalculateGameScores(gameId: string) {
  const reviews = await prisma.review.findMany({
    where: { gameId },
    select: { score: true, roleAtCreation: true },
  });

  const breakdown = calculateScoreBreakdown(reviews);

  await prisma.game.update({
    where: { id: gameId },
    data: {
      // The existing schema uses non-null Float fields, so 0 is the compatibility
      // sentinel for a source with no reviews. The UI uses counts to show "Not rated".
      expertScore: breakdown.expertScore ?? 0,
      streamerScore: breakdown.creatorScore ?? 0,
      userScore: breakdown.playerScore ?? 0,
      overallScore: breakdown.overallScore ?? 0,
      reviewCount: breakdown.totalCount,
      discussionCount: await prisma.comment.count({
        where: { gameId, reviewId: null, isDeleted: false },
      }),
    },
  });

  return breakdown;
}
