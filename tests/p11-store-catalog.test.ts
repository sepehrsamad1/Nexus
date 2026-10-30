import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function read(path: string) {
  return fs.readFileSync(path, 'utf8');
}

test('P11 schema stores product rating, review count, pricing provenance and image sources', () => {
  const schema = read('prisma/schema.prisma');
  assert.match(schema, /imageSourceJson\\s+String\\s+@default\\("\\[\\]"\\)/);
  assert.match(schema, /rating\\s+Float\\s+@default\\(0\\)/);
  assert.match(schema, /reviewCount\\s+Int\\s+@default\\(0\\)/);
  assert.match(schema, /priceSource\\s+String\\?/);
  assert.match(schema, /priceCheckedAt\\s+DateTime\\?/);
  assert.match(schema, /sourceUrl\\s+String\\?/);
});

test('P11 seed contains exactly the 15 roadmap products', () => {
  const seed = read('prisma/seed.ts');
  const required = [
    'Wooting 80HE+',
    'G PRO X SUPERLIGHT 2',
    'Viper V4 Pro',
    'BlackShark V3 Pro',
    'Arctis Nova Elite',
    'Ninja FX Zero',
    'XL2566K',
    'UltraGear OLED 27GS95QE',
    'TITAN Evo',
    'Wave:3',
    'Facecam MK.2',
    'WD_BLACK SN850X 2TB',
    'Radeon RX 9070 XT',
    'GeForce RTX 5070 Ti',
    'DualSense Edge',
  ];
  assert.equal((seed.match(/slug: '/g) ?? []).length, 15);
  for (const name of required) assert.ok(seed.includes(name), `Missing roadmap product: ${name}`);
});

test('P11 products have multiple image references and no placeholder-image copy', () => {
  const seed = read('prisma/seed.ts');
  assert.match(seed, /imagesJson:\\s*JSON\\.stringify\\(\\[\\s*\`\\/api\\/product-image/);
  assert.match(seed, /imageSourceJson:\\s*JSON\\.stringify\\(\\[product\\.sourceUrl, product\\.sourceUrl\\]\\)/);
  assert.doesNotMatch(seed, /Product Image/i);
  assert.doesNotMatch(seed, /placeholder\\.com/i);
});

test('P11 product image route produces real SVG catalog artwork instead of a broken placeholder', () => {
  const route = read('src/app/api/product-image/[slug]/route.ts');
  assert.match(route, /Content-Type.*image\\/svg\\+xml/);
  assert.match(route, /NEXUS CURATED GEAR CATALOG/);
  assert.doesNotMatch(route, /Product Image/i);
});

test('P11 store UI renders rating, stock, gallery and price provenance', () => {
  const store = read('src/app/store/page.tsx');
  const detail = read('src/app/store/[slug]/page.tsx');
  assert.match(store, /market rating|No market rating available/);
  assert.match(store, /inStock/);
  assert.match(detail, /Technical specifications/);
  assert.match(detail, /Price reference/);
  assert.match(detail, /Manufacturer reference/);
  assert.doesNotMatch(store, /Product Image/i);
  assert.doesNotMatch(detail, /Product Image/i);
});
