import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MEDIA_KIND, mediaAltText, sortMediaAssets } from '../src/lib/media';

test('media foundation supports the four configured asset kinds', () => {
  assert.deepEqual(Object.values(MEDIA_KIND), ['COVER', 'HERO', 'GALLERY', 'TRAILER_THUMBNAIL']);
});

test('media alt text falls back when metadata is empty', () => {
  assert.equal(mediaAltText({ altText: ' ' }, 'Game cover'), 'Game cover');
  assert.equal(mediaAltText({ altText: 'Elden Ring cover' }, 'Game cover'), 'Elden Ring cover');
});

test('media assets sort deterministically by sortOrder', () => {
  const assets = [{ sortOrder: 3 }, { sortOrder: 1 }, { sortOrder: 2 }];
  assert.deepEqual(sortMediaAssets(assets).map(asset => asset.sortOrder), [1, 2, 3]);
});

test('main media journeys do not contain known placeholder-image strings', () => {
  const files = [
    'src/app/store/[slug]/page.tsx',
    'src/app/store/page.tsx',
    'src/app/games/page.tsx',
    'src/app/games/[slug]/page.tsx',
  ];
  for (const file of files) {
    const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
    assert.equal(content.includes('via.placeholder.com'), false, file);
    assert.equal(content.includes('Product Image'), false, file);
  }
});

test('resilient media component handles image load failure without a broken-image surface', () => {
  const content = fs.readFileSync(path.join(process.cwd(), 'src/components/MediaImage.tsx'), 'utf8');
  assert.match(content, /onError=\{\(\) => setFailed\(true\)\}/);
  assert.match(content, /role="img"/);
});
