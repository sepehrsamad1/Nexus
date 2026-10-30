import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function read(path: string) {
  return fs.readFileSync(path, 'utf8');
}

test('P11 schema stores product rating, review count, pricing provenance and image sources', () => {
  const schema = read('prisma/schema.prisma');
  for (const field of ['imageSourceJson', 'rating', 'reviewCount', 'priceSource', 'priceCheckedAt', 'sourceUrl']) {
    assert.ok(schema.includes(field), `Missing Product field: ${field}`);
  }
});

test('P11 seed contains exactly the 15 roadmap products', () => {
  const seed = read('prisma/seed.ts');
  const required = [
    'Wooting 80HE+', 'G PRO X SUPERLIGHT 2', 'Viper V4 Pro', 'BlackShark V3 Pro',
    'Arctis Nova Elite', 'Ninja FX Zero', 'XL2566K', 'UltraGear OLED 27GS95QE',
    'TITAN Evo', 'Wave:3', 'Facecam MK.2', 'WD_BLACK SN850X 2TB',
    'Radeon RX 9070 XT', 'GeForce RTX 5070 Ti', 'DualSense Edge',
  ];
  const gearSection = seed.slice(seed.indexOf('const gearCatalog = ['), seed.indexOf('  const products = await Promise.all'));
  assert.equal((gearSection.match(/slug: '/g) ?? []).length, 15);
  for (const name of required) assert.ok(seed.includes(name), `Missing roadmap product: ${name}`);
});

test('P11 products have multiple image references and no placeholder-image copy', () => {
  const seed = read('prisma/seed.ts');
  assert.ok(seed.includes('/api/product-image/'));
  assert.ok(seed.includes('imageSourceJson: JSON.stringify([product.sourceUrl, product.sourceUrl])'));
  assert.ok(!seed.toLowerCase().includes('product image'));
  assert.ok(!seed.includes('placeholder.com'));
});

test('P11 product image route produces SVG catalog artwork', () => {
  const route = read('src/app/api/product-image/[slug]/route.ts');
  assert.ok(route.includes('image/svg+xml'));
  assert.ok(route.includes('NEXUS CURATED GEAR CATALOG'));
  assert.ok(!route.toLowerCase().includes('product image'));
});

test('P11 store UI renders rating, stock, gallery and price provenance', () => {
  const store = read('src/app/store/page.tsx');
  const detail = read('src/app/store/[slug]/page.tsx');
  assert.ok(store.includes('No market rating available'));
  assert.ok(store.includes('inStock'));
  assert.ok(detail.includes('Technical specifications'));
  assert.ok(detail.includes('Price reference'));
  assert.ok(detail.includes('Manufacturer reference'));
  assert.ok(!store.toLowerCase().includes('product image'));
  assert.ok(!detail.toLowerCase().includes('placeholder.com'));
});
