import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const page = fs.readFileSync('src/app/games/[slug]/page.tsx', 'utf8');
const sidebar = fs.readFileSync('src/components/store/ReviewCommerceSidebar.tsx', 'utf8');

test('P05 flagship game profile contains all core sections', () => {
  for (const section of [
    'Score Breakdown',
    'Media & Trailer',
    'Reviews',
    'Community Discussion',
    'Related Games',
    'Related Gaming Gear',
    'Nexus Score',
  ]) {
    assert.equal(page.includes(section), true, section);
  }
});

test('P05 game profile supports expert, creator and player perspectives', () => {
  assert.match(page, /roleMeta/);
  assert.match(page, /EXPERT/);
  assert.match(page, /STREAMER/);
  assert.match(page, /USER/);
  assert.match(page, /ReviewModal/);
});

test('P05 game profile queries related games, discussion and commerce data', () => {
  assert.match(page, /prisma\.comment\.findMany/);
  assert.match(page, /prisma\.game\.findMany/);
  assert.match(page, /prisma\.product\.findMany/);
  assert.match(page, /relatedGameId: game\.id/);
});

test('P05 representative catalog slugs remain routable through the shared detail page', () => {
  const seed = fs.readFileSync('prisma/seed.ts', 'utf8');
  for (const slug of [
    'demons-souls',
    'dota-2',
    'counter-strike-2',
    'red-dead-redemption-2',
    'clair-obscur-expedition-33',
  ]) {
    assert.match(seed, new RegExp(`\\['${slug}',`), slug);
  }
  assert.match(page, /where: \{ slug \}/);
});

test('P05 detail journey avoids known placeholder image URLs', () => {
  assert.equal(page.includes('via.placeholder.com'), false);
  assert.equal(sidebar.includes('via.placeholder.com'), false);
});
