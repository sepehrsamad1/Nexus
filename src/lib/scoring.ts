import prisma from './prisma';

export async function recalculateGameScores(gameId: string) {
  // Fetch all reviews for this game
  const reviews = await prisma.review.findMany({
    where: { gameId },
    select: { score: true, roleAtCreation: true }
  });

  if (reviews.length === 0) {
    await prisma.game.update({
      where: { id: gameId },
      data: { expertScore: 0, streamerScore: 0, userScore: 0, overallScore: 0, reviewCount: 0, discussionCount: 0 }
    });
    return;
  }

  const experts = reviews.filter(r => r.roleAtCreation === 'EXPERT');
  const streamers = reviews.filter(r => r.roleAtCreation === 'STREAMER');
  const users = reviews.filter(r => r.roleAtCreation === 'USER');

  const calcAverage = (revs: { score: number }[]) => 
    revs.length > 0 ? Math.round(revs.reduce((acc, r) => acc + r.score, 0) / revs.length) : 0;

  const expertScore = calcAverage(experts);
  const streamerScore = calcAverage(streamers);
  const userScore = calcAverage(users);
  const overallScore = Math.round((expertScore * 0.45 + streamerScore * 0.30 + userScore * 0.25) * 10) / 10;
  const discussionCount = await prisma.comment.count({ where: { gameId } });

  await prisma.game.update({
    where: { id: gameId },
    data: {
      expertScore,
      streamerScore,
      userScore,
      overallScore,
      reviewCount: reviews.length,
      discussionCount,
    }
  });
}
