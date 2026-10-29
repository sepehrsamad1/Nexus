import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { canFollowCreator, creatorDiscoveryScore, sortCreatorsForDiscovery } from '../src/lib/creator';

test('P07 follow authorization rejects self-follow and non-creators', () => {
  assert.equal(canFollowCreator('user-a', 'user-a', 'STREAMER'), false);
  assert.equal(canFollowCreator('user-a', 'user-b', 'USER'), false);
  assert.equal(canFollowCreator('user-a', 'user-b', 'EXPERT'), false);
  assert.equal(canFollowCreator('user-a', 'user-b', 'STREAMER'), true);
});

test('P07 creator discovery follows are reversible and uniqueness is enforced', () => {
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const action = fs.readFileSync('src/actions/creator.ts', 'utf8');
  assert.match(schema, /@@unique\(\[followerId, followingId\]\)/);
  assert.match(action, /creatorFollow\.findUnique/);
  assert.match(action, /creatorFollow\.create/);
  assert.match(action, /creatorFollow\.delete/);
  assert.match(action, /session\.user\.id !== creator\.id|canFollowCreator/);
});

test('P07 follower count affects creator discovery ordering only', () => {
  assert.equal(creatorDiscoveryScore(42), 42);
  const creators = [
    { id: 'a', displayName: 'Alpha', handle: 'alpha', followerCount: 2, reviewCount: 9 },
    { id: 'b', displayName: 'Beta', handle: 'beta', followerCount: 20, reviewCount: 1 },
  ];
  assert.deepEqual(sortCreatorsForDiscovery(creators).map((creator) => creator.id), ['b', 'a']);
});

test('P07 follower count is not part of the numeric game score calculation', () => {
  const scoring = fs.readFileSync('src/lib/scoring.ts', 'utf8');
  assert.doesNotMatch(scoring, /followerCount|CreatorFollow|creatorFollow/);
  assert.match(scoring, /expertScore \* 0\.45/);
  assert.match(scoring, /streamerScore \* 0\.30/);
  assert.match(scoring, /userScore \* 0\.25/);
});

test('P07 creator data is clearly marked as demo/editorial when identity is unverified', () => {
  const seed = fs.readFileSync('prisma/seed.ts', 'utf8');
  const profilePage = fs.readFileSync('src/app/creators/[id]/page.tsx', 'utf8');
  const discoveryPage = fs.readFileSync('src/app/creators/page.tsx', 'utf8');
  assert.match(seed, /isDemoEditorial: true/);
  assert.match(profilePage, /Demo \/ Editorial/);
  assert.match(discoveryPage, /Demo \/ Editorial Creator/);
});
