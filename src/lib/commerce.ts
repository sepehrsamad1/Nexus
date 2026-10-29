import { checkoutPayloadSchema } from '@/lib/validation';

export function cartItemIdentity(type: string, id: string) {
  return `${type}:${id}`;
}

export function normalizeCheckoutItems(input: unknown) {
  const parsed = checkoutPayloadSchema.safeParse(input);
  if (!parsed.success) throw new Error('Invalid cart contents.');
  const seen = new Set<string>();
  for (const item of parsed.data.items) {
    const key = cartItemIdentity(item.type, item.id);
    if (seen.has(key)) throw new Error('Duplicate cart items are not allowed.');
    seen.add(key);
  }
  return parsed.data.items;
}

export function consumeDigitalKeys(keys: string[], quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid digital-key quantity.');
  if (keys.length < quantity) throw new Error('Insufficient digital-key stock.');
  return {
    delivered: keys.slice(-quantity),
    remaining: keys.slice(0, -quantity),
  };
}