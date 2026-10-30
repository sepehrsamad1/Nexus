import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkoutPayloadSchema } from '../src/lib/validation';

test('P12 cart and wishlist use local persistence and server-compatible quantity bounds', () => {
  const cart = readFileSync(resolve(process.cwd(), 'src/store/useCart.ts'), 'utf8');
  const wishlist = readFileSync(resolve(process.cwd(), 'src/store/useWishlist.ts'), 'utf8');
  assert.match(cart, /persist\(/);
  assert.match(cart, /nexus-cart-storage/);
  assert.match(wishlist, /persist\(/);
  assert.match(wishlist, /nexus-wishlist-storage/);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ id: 'game_1', type: 'DIGITAL_KEY', quantity: 1 }] }).success, true);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ id: 'game_1', type: 'DIGITAL_KEY', quantity: 99 }] }).success, true);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ id: 'game_1', type: 'DIGITAL_KEY', quantity: 100 }] }).success, false);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ id: 'game_1', type: 'DIGITAL_KEY', quantity: 0 }] }).success, false);
});

test('P12 exposes dedicated cart and wishlist pages with useful empty states', () => {
  const cart = readFileSync(resolve(process.cwd(), 'src/app/cart/page.tsx'), 'utf8');
  const wishlist = readFileSync(resolve(process.cwd(), 'src/app/wishlist/page.tsx'), 'utf8');
  assert.match(cart, /Your cart is empty/);
  assert.match(cart, /Final stock and prices are revalidated on checkout/);
  assert.match(wishlist, /Nothing saved yet/);
  assert.match(wishlist, /persists across refreshes/);
});
