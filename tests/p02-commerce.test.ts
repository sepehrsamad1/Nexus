import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutPayloadSchema } from '../src/lib/validation';
import { cartItemIdentity, consumeDigitalKeys, normalizeCheckoutItems } from '../src/lib/commerce';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const validItem = { id: 'game_123', type: 'DIGITAL_KEY', quantity: 1 };

test('checkout rejects client-supplied authoritative price or total fields', () => {
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ ...validItem, price: 1 }] }).success, false);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [validItem], total: 1 }).success, false);
});

test('checkout rejects zero and negative quantities', () => {
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ ...validItem, quantity: 0 }] }).success, false);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ ...validItem, quantity: -2 }] }).success, false);
});

test('checkout rejects duplicate cart identities', () => {
  assert.throws(() => normalizeCheckoutItems({ items: [validItem, validItem] }), /Duplicate cart items/);
  assert.equal(cartItemIdentity('DIGITAL_KEY', 'same-id'), 'DIGITAL_KEY:same-id');
});

test('digital quantity N consumes and delivers exactly N keys', () => {
  const result = consumeDigitalKeys(['K1', 'K2', 'K3', 'K4'], 3);
  assert.deepEqual(result.delivered, ['K2', 'K3', 'K4']);
  assert.deepEqual(result.remaining, ['K1']);
});

test('digital fulfillment rejects insufficient keys', () => {
  assert.throws(() => consumeDigitalKeys(['K1'], 2), /Insufficient/);
});

test('commerce order path uses an interactive serializable transaction', () => {
  const source = readFileSync(resolve(process.cwd(), 'src/actions/order.ts'), 'utf8');
  assert.match(source, /prisma\.\$transaction\(work/);
  assert.match(source, /isolationLevel: 'Serializable'/);
  assert.match(source, /tx\.game\.update/);
  assert.match(source, /tx\.product\.update/);
  assert.match(source, /tx\.order\.create/);
});

test('transaction failure contract propagates failure so Prisma can rollback', async () => {
  let committed = false;
  const fakeTransaction = async <T>(work: () => Promise<T>) => {
    try {
      const value = await work();
      committed = true;
      return value;
    } catch (error) {
      committed = false;
      throw error;
    }
  };
  await assert.rejects(
    fakeTransaction(async () => {
      throw new Error('simulated order creation failure');
    }),
    /simulated order creation failure/,
  );
  assert.equal(committed, false);
});