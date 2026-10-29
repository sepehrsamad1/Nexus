import test from 'node:test';
import assert from 'node:assert/strict';
import { commentInputSchema, idSchema, reviewInputSchema, roleSchema } from '../src/lib/validation';

test('role schema rejects arbitrary roles', () => {
  assert.equal(roleSchema.safeParse('OWNER').success, false);
  assert.equal(roleSchema.safeParse('ADMIN').success, true);
});

test('identifier schema rejects malformed IDs', () => {
  assert.equal(idSchema.safeParse('').success, false);
  assert.equal(idSchema.safeParse('../secret').success, false);
  assert.equal(idSchema.safeParse('clx_valid-123').success, true);
});

test('review schema rejects invalid score, oversized content and unsafe URL', () => {
  const base = { gameId: 'clx_game123', score: 101, title: 'Test', content: 'Review', videoUrl: 'javascript:alert(1)', pros: [], cons: [] };
  assert.equal(reviewInputSchema.safeParse(base).success, false);
  assert.equal(reviewInputSchema.safeParse({ ...base, score: 80, videoUrl: 'https://example.com/video' }).success, true);
  assert.equal(reviewInputSchema.safeParse({ ...base, score: 80, videoUrl: 'https://example.com/video', content: 'x'.repeat(10001) }).success, false);
});

test('comment schema requires exactly one discussion target', () => {
  assert.equal(commentInputSchema.safeParse({ content: 'hello' }).success, false);
  assert.equal(commentInputSchema.safeParse({ reviewId: 'review_123', gameId: 'game_123', content: 'hello' }).success, false);
  assert.equal(commentInputSchema.safeParse({ reviewId: 'review_123', content: 'hello' }).success, true);
});
