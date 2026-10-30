import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path: string) => fs.readFileSync(path, 'utf8');

test('P15 user profile exposes identity, activity, privacy-safe metrics and saved items', () => {
  const page = read('src/app/profile/page.tsx');
  assert.match(page, /Your Profile/);
  assert.match(page, /Followers/);
  assert.match(page, /Following/);
  assert.match(page, /Reviews/);
  assert.match(page, /Comments/);
  assert.match(page, /Reputation/);
  assert.match(page, /Private account details/);
  assert.doesNotMatch(page, /user\.email/);
  assert.match(page, /ProfileSavedSummary/);
});

test('P15 creator profile distinguishes demo editorial creators and shows creator metrics', () => {
  const page = read('src/app/creators/[id]/page.tsx');
  assert.match(page, /Demo \/ Editorial/);
  assert.match(page, /not verified/);
  assert.match(page, /followers/);
  assert.match(page, /following/);
  assert.match(page, /Creator Reviews/);
  assert.match(page, /Creator Posts/);
  assert.match(page, /Participation/);
});

test('P15 creator discovery links use public handles rather than internal IDs', () => {
  const page = read('src/app/creators/page.tsx');
  assert.match(page, /creator\.creatorProfile!\.handle/);
  assert.doesNotMatch(page, /href=\{'\/creators\/' \+ creator\.id\}/);
});

test('P15 saved profile summary uses the device-local wishlist and provides an empty state', () => {
  const component = read('src/components/profile/ProfileSavedSummary.tsx');
  assert.match(component, /useWishlist/);
  assert.match(component, /Nothing saved yet/);
  assert.match(component, /Open wishlist/);
});
