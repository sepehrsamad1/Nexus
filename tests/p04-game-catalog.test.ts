import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const seed = fs.readFileSync('prisma/seed.ts', 'utf8');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const canonicalSlugs = [
  'demons-souls',
  'dark-souls',
  'dark-souls-2',
  'dark-souls-3',
  'bloodborne',
  'sekiro-shadows-die-twice',
  'elden-ring',
  'god-of-war',
  'god-of-war-ragnarok',
  'uncharted-2',
  'uncharted-4',
  'assassins-creed-ii',
  'assassins-creed-brotherhood',
  'assassins-creed-revelations',
  'skyrim',
  'dota-2',
  'counter-strike-2',
  'devil-may-cry-3',
  'devil-may-cry-5',
  'clair-obscur-expedition-33',
  'red-dead-redemption-2',
  'the-witcher-3',
  'baldurs-gate-3',
  'cyberpunk-2077',
  'hollow-knight',
  'resident-evil-4-remake',
  'black-myth-wukong',
  'monster-hunter-world',
  'hades',
  'resident-evil-requiem',
];

test('P04 seed contains exactly the 30 canonical game slugs', () => {
  const catalogMatch = seed.match(/const gameCatalog = \[([\s\S]*?)\n  \] as const;/);
  assert.ok(catalogMatch, 'gameCatalog must be present');
  const body = catalogMatch[1];
  const slugs = [...body.matchAll(/^\s*\['([^']+)'\s*,/gm)].map(match => match[1]);
  assert.deepEqual(slugs, canonicalSlugs);
  assert.equal(slugs.length, 30);
  assert.equal(new Set(slugs).size, 30);
});

test('P04 seed is deterministic and idempotent for media', () => {
  assert.equal(seed.includes('Math.random'), false);
  assert.match(seed, /await prisma\.mediaAsset\.deleteMany\(\)/);
  assert.match(seed, /overallScore/);
  assert.match(seed, /reviewCount: 4/);
  assert.match(seed, /discussionCount: 3/);
});

test('Game stores overall and aggregate discussion metadata', () => {
  assert.match(schema, /overallScore\s+Float/);
  assert.match(schema, /reviewCount\s+Int/);
  assert.match(schema, /discussionCount\s+Int/);
});

test('Every canonical game receives cover, hero and trailer media records', () => {
  assert.match(seed, /kind: 'COVER'/);
  assert.match(seed, /kind: 'HERO'/);
  assert.match(seed, /kind: 'TRAILER_THUMBNAIL'/);
  assert.match(seed, /games\.flatMap\(\(game\)/);
});
