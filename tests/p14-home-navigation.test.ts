import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

test('P14 homepage presents the full Nexus ecosystem', () => {
  const page = read('src/app/page.tsx');
  assert.match(page, /Gaming discovery, reviews & community/);
  assert.match(page, /Featured games/);
  assert.match(page, /Trending now/);
  assert.match(page, /What players are discussing/);
  assert.match(page, /Fresh creator activity/);
  assert.match(page, /Gear for your next session/);
  assert.match(page, /overallScore/);
  assert.doesNotMatch(page, /Part 3 Active|Part 4 Active|development milestone/i);
});

test('P14 navigation exposes the ecosystem on desktop and mobile', () => {
  const nav = read('src/components/Navbar.tsx');
  for (const label of ['Games', 'Community', 'Creators', 'Store']) {
    assert.match(nav, new RegExp(label));
  }
  assert.match(nav, /action="\/search"/);
  assert.match(nav, /name="q"/);
  assert.match(nav, /Open global search/);
  assert.match(nav, /md:hidden/);
});
