import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkoutPayloadSchema, paymentSimulationSchema } from '../src/lib/validation';
import { consumeDigitalKeys } from '../src/lib/commerce';

test('P13 checkout validates cart and simulated payment without card data', () => {
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ id: 'p1', type: 'PHYSICAL_GEAR', quantity: 1 }] }).success, true);
  assert.equal(checkoutPayloadSchema.safeParse({ items: [{ id: 'p1', type: 'PHYSICAL_GEAR', quantity: 0 }] }).success, false);
  assert.equal(paymentSimulationSchema.safeParse({ outcome: 'SUCCESS' }).success, true);
  assert.equal(paymentSimulationSchema.safeParse({ outcome: 'FAILURE' }).success, true);
});

test('P13 digital fulfillment consumes exactly requested keys', () => {
  const result = consumeDigitalKeys(['KEY-1', 'KEY-2', 'KEY-3'], 2);
  assert.deepEqual(result.delivered, ['KEY-2', 'KEY-3']);
  assert.deepEqual(result.remaining, ['KEY-1']);
});

test('P13 UI marks payment as prototype-only and exposes order details', () => {
  const checkout = readFileSync(resolve(process.cwd(), 'src/app/checkout/page.tsx'), 'utf8');
  const detail = readFileSync(resolve(process.cwd(), 'src/app/profile/orders/[id]/page.tsx'), 'utf8');
  assert.match(checkout, /Prototype simulation only/);
  assert.match(checkout, /Simulate payment failure/);
  assert.doesNotMatch(checkout, /name=["']cardNumber["']/);
  assert.match(detail, /Order detail/);
  assert.match(detail, /Delivered digital keys/);
});
