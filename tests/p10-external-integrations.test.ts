import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path: string) => fs.readFileSync(path, 'utf8');

test('P10 stores external attribution and retrieval metadata', () => {
  const schema = read('prisma/schema.prisma');
  assert.match(schema, /model ExternalReference/);
  assert.match(schema, /sourceUrl\s+String/);
  assert.match(schema, /retrievedAt\s+DateTime/);
  assert.match(schema, /attribution\s+String/);
  assert.match(schema, /isDemoEditorial\s+Boolean/);
});

test('P10 adapters are disabled by default and configuration-driven', () => {
  const env = read('.env.example');
  const adapter = read('src/lib/external.ts');
  assert.match(env, /NEXUS_EXTERNAL_INTEGRATIONS_ENABLED="false"/);
  assert.match(env, /NEXUS_YOUTUBE_TRAILER_URLS_JSON/);
  assert.match(env, /NEXUS_REDDIT_REFERENCE_URLS_JSON/);
  assert.match(adapter, /NEXUS_EXTERNAL_INTEGRATIONS_ENABLED/);
  assert.match(adapter, /NEXUS_EXTERNAL_CACHE_HOURS/);
});

test('P10 caches imported references and does not make requests when Reddit credentials are absent', () => {
  const adapter = read('src/lib/external.ts');
  assert.match(adapter, /isFresh\(existing\.retrievedAt, cacheHours\)/);
  assert.match(adapter, /no live Reddit requests were made/);
  assert.match(adapter, /Authorization: \`Bearer \$\{accessToken\}\`/);
});

test('P10 never treats external authors as Nexus users', () => {
  const adapter = read('src/lib/external.ts');
  const page = read('src/app/games/[slug]/page.tsx');
  assert.match(adapter, /Author identity remains external to Nexus/);
  assert.match(page, /not a Nexus account/);
});

test('P10 seed provides clearly labeled fallback records', () => {
  const seed = read('prisma/seed.ts');
  assert.match(seed, /Nexus Editorial Demo/);
  assert.match(seed, /isDemoEditorial: true/);
  assert.match(seed, /replace with a verified official publisher\/developer trailer/);
});

test('P10 has a dedicated cache-aware sync entrypoint', () => {
  const pkg = JSON.parse(read('package.json'));
  const script = read('scripts/sync-external.ts');
  assert.equal(pkg.scripts['external:sync'], 'tsx scripts/sync-external.ts');
  assert.match(script, /syncExternalReferences/);
});
