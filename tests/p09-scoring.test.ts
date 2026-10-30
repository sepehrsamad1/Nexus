import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { calculateScoreBreakdown } from '../src/lib/scoring';

test('P09 calculates deterministic source scores and weighted overall score', () => {
  const result = calculateScoreBreakdown([
    { roleAtCreation: 'EXPERT', score: 80 },
    { roleAtCreation: 'EXPERT', score: 100 },
    { roleAtCreation: 'STREAMER', score: 70 },
    { roleAtCreation: 'USER', score: 90 },
    { roleAtCreation: 'USER', score: 80 },
  ]);

  assert.equal(result.expertScore, 90);
  assert.equal(result.creatorScore, 70);
  assert.equal(result.playerScore, 85);
  assert.equal(result.expertCount, 2);
  assert.equal(result.creatorCount, 1);
  assert.equal(result.playerCount, 2);
  assert.equal(result.totalCount, 5);
  assert.equal(result.overallScore, 82.8);
});

test('P09 renormalizes overall weights when a source is missing', () => {
  const result = calculateScoreBreakdown([
    { roleAtCreation: 'EXPERT', score: 90 },
    { roleAtCreation: 'USER', score: 85 },
  ]);

  assert.equal(result.expertScore, 90);
  assert.equal(result.creatorScore, null);
  assert.equal(result.playerScore, 85);
  assert.equal(result.overallScore, 88.2);
});

test('P09 returns explicit missing-source state instead of NaN', () => {
  const result = calculateScoreBreakdown([]);

  assert.equal(result.expertScore, null);
  assert.equal(result.creatorScore, null);
  assert.equal(result.playerScore, null);
  assert.equal(result.overallScore, null);
  assert.equal(result.expertCount, 0);
  assert.equal(result.creatorCount, 0);
  assert.equal(result.playerCount, 0);
  assert.equal(result.totalCount, 0);
  assert.ok(Number.isNaN(result.overallScore ?? 0) === false);
});

test('P09 handles score boundaries deterministically', () => {
  const result = calculateScoreBreakdown([
    { roleAtCreation: 'EXPERT', score: 0 },
    { roleAtCreation: 'EXPERT', score: 100 },
    { roleAtCreation: 'STREAMER', score: -10 },
    { roleAtCreation: 'USER', score: 120 },
  ]);

  assert.equal(result.expertScore, 50);
  assert.equal(result.creatorScore, 0);
  assert.equal(result.playerScore, 100);
  assert.equal(result.overallScore, 47.5);
});

test('P09 documents that follower count does not affect scoring', () => {
  const scoring = fs.readFileSync('src/lib/scoring.ts', 'utf8');

  assert.doesNotMatch(scoring, /followerCount|CreatorFollow|creatorFollow/);
  assert.match(scoring, /0\.45/);
  assert.match(scoring, /0\.30/);
  assert.match(scoring, /0\.25/);
  assert.match(scoring, /renormalized|renormalize/);
});
