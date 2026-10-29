export const CREATOR_ROLE = 'STREAMER' as const;

export type CreatorDiscoveryItem = {
  id: string;
  displayName: string;
  handle: string;
  followerCount: number;
  reviewCount: number;
};

export function canFollowCreator(
  followerId: string,
  targetId: string,
  targetRole: string,
) {
  return followerId.length > 0 && targetId.length > 0 && followerId !== targetId && targetRole === CREATOR_ROLE;
}

export function creatorDiscoveryScore(followerCount: number) {
  // Followers influence reach/discovery only. This value must never be used
  // by the game scoring engine or added to a game/review score.
  return Math.max(0, followerCount);
}

export function sortCreatorsForDiscovery<T extends CreatorDiscoveryItem>(creators: T[]) {
  return [...creators].sort(
    (a, b) =>
      creatorDiscoveryScore(b.followerCount) - creatorDiscoveryScore(a.followerCount) ||
      b.reviewCount - a.reviewCount ||
      a.displayName.localeCompare(b.displayName),
  );
}
