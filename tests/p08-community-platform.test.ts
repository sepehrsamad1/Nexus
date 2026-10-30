import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { commentInputSchema } from '../src/lib/validation';

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

test('P08 schema prevents duplicate votes and indexes discussion trees', () => {
  const schema = read('prisma/schema.prisma');
  assert.match(schema, /@@unique\(\[userId, reviewId\]\)/);
  assert.match(schema, /@@unique\(\[userId, commentId\]\)/);
  assert.match(schema, /@@index\(\[gameId, parentId, createdAt\]\)/);
  assert.match(schema, /@@index\(\[reviewId, parentId, createdAt\]\)/);
});

test('P08 comment validation is moderation-safe and target-specific', () => {
  assert.equal(commentInputSchema.safeParse({ gameId: 'game_1', content: 'A respectful game discussion.' }).success, true);
  assert.equal(commentInputSchema.safeParse({ gameId: 'game_1', reviewId: 'review_1', content: 'invalid target' }).success, false);
  assert.equal(commentInputSchema.safeParse({ gameId: 'game_1', content: 'bad\u0000content' }).success, false);
  assert.equal(commentInputSchema.safeParse({ gameId: 'game_1', content: 'x'.repeat(5001) }).success, false);
});

test('P08 voting action is transactional and rejects missing/deleted targets', () => {
  const action = read('src/actions/discussion.ts');
  assert.match(action, /prisma\.\$transaction/);
  assert.match(action, /Discussion target not found/);
  assert.match(action, /isDeleted/);
  assert.match(action, /userId_commentId/);
  assert.match(action, /userId_reviewId/);
  assert.match(action, /Unauthorized/);
});

test('P08 comment mutation enforces parent stays inside its discussion target', () => {
  const action = read('src/actions/discussion.ts');
  assert.match(action, /parent\.reviewId !== reviewId/);
  assert.match(action, /parent\.gameId !== gameId/);
  assert.match(action, /parent\.isDeleted/);
  assert.match(action, /discussionCount: \{ increment: 1 \}/);
});

test('P08 community feed is real, game-specific, and supports hot/new filters', () => {
  const page = read('src/app/community/page.tsx');
  assert.match(page, /parentId: null/);
  assert.match(page, /gameId: selectedGame\?\.id/);
  assert.match(page, /params\.sort === 'new'/);
  assert.match(page, /discussionScore/);
  assert.match(page, /RootCommentForm gameId=/);
  assert.match(page, /_count: \{ select: \{ replies: true \} \}/);
});

test('P08 game detail renders the full nested community tree and composer', () => {
  const page = read('src/app/games/[slug]/page.tsx');
  assert.match(page, /RootCommentForm gameId=/);
  assert.match(page, /CommentTree comments=\{commentTree\}/);
  assert.match(page, /reviewId: null/);
  assert.match(page, /discussionVoteMap/);
});

test('P08 homepage exposes latest game discussion activity', () => {
  const page = read('src/app/page.tsx');
  assert.match(page, /latestDiscussions/);
  assert.match(page, /Community Activity/);
  assert.match(page, /\/games\/.*#community/);
});

test('P08 community UI has explicit loading and recoverable error states', () => {
  const loading = read('src/app/community/loading.tsx');
  const error = read('src/app/community/error.tsx');
  assert.match(loading, /animate-pulse/);
  assert.match(error, /Try again/);
  assert.match(error, /temporarily unavailable/);
});

test('P08 seed contains safe game-level demo discussions and P09 derives discussion counts from comments', () => {
  const seed = read('prisma/seed.ts');
  const scoring = read('src/lib/scoring.ts');
  assert.match(seed, /game-level demo discussion/);
  assert.match(seed, /not a real user quote/);
  assert.match(seed, /const gameDiscussion = await prisma\\.comment\\.create/);
  assert.match(seed, /gameId: game\\.id/);
  assert.match(scoring, /discussionCount: await prisma\\.comment\\.count/);
  assert.match(scoring, /reviewId: null/);
});
