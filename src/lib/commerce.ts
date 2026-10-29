export function cartItemIdentity(type: string, id: string) {
  return `${type}:${id}`;
}

export function consumeDigitalKeys(keys: string[], quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Invalid digital-key quantity.');
  if (keys.length < quantity) throw new Error('Insufficient digital-key stock.');
  return {
    delivered: keys.slice(-quantity),
    remaining: keys.slice(0, -quantity),
  };
}