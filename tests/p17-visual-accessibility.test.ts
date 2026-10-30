import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function read(path: string) {
  return fs.readFileSync(path, 'utf8');
}

test('P17 global polish provides accessible focus and reduced-motion behavior', () => {
  const css = read('src/app/globals.css');
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /color-scheme:\s*dark/);
});

test('P17 media wrapper documents why arbitrary remote imagery stays out of next/image', () => {
  const media = read('src/components/MediaImage.tsx');
  assert.match(media, /next\/image would require/);
  assert.match(media, /onError/);
  assert.match(media, /fetchPriority/);
});

test('P17 key interactive surfaces have loading skeletons and resilient error states', () => {
  assert.match(read('src/app/store/loading.tsx'), /aria-busy/);
  assert.match(read('src/app/search/loading.tsx'), /aria-busy/);
  assert.match(read('src/app/error.tsx'), /role="alert"/);
  assert.match(read('src/app/not-found.tsx'), /Page not found/);
});

test('P17 removes roadmap/development milestone language from visible store copy', () => {
  const store = read('src/app/store/page.tsx');
  assert.doesNotMatch(store, /P\d+|Part \d+ Active|Local Development Mode Active/i);
});

test('P17 avoids raw product/profile image tags in polished surfaces', () => {
  assert.doesNotMatch(read('src/app/wishlist/page.tsx'), /<img\b/);
  assert.doesNotMatch(read('src/app/cart/page.tsx'), /<img\b/);
  assert.doesNotMatch(read('src/app/checkout/page.tsx'), /<img\b/);
  assert.doesNotMatch(read('src/app/profile/page.tsx'), /<img\b/);
});
