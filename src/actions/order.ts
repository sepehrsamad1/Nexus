import 'server-only';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { safeJsonParse } from '@/lib/utils';
import { checkoutPayloadSchema } from '@/lib/validation';
import { consumeDigitalKeys } from '@/lib/commerce';
import type { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export class CommerceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommerceValidationError';
  }
}

export async function runCommerceTransaction<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(work, {
    isolationLevel: 'Serializable',
    maxWait: 5000,
    timeout: 10000,
  });
}

export function normalizeCheckoutItems(input: unknown) {
  const parsed = checkoutPayloadSchema.safeParse(input);
  if (!parsed.success) throw new CommerceValidationError('Invalid cart contents.');

  const seen = new Set<string>();
  for (const item of parsed.data.items) {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) throw new CommerceValidationError('Duplicate cart items are not allowed.');
    seen.add(key);
  }

  return parsed.data.items;
}

export async function fulfillMockOrder(input: unknown) {
  const session = await getSession();
  if (!session?.user) throw new CommerceValidationError('Unauthorized');

  const items = normalizeCheckoutItems(input);

  const result = await runCommerceTransaction(async (tx) => {
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    const deliveredKeys: { gameTitle: string; key: string }[] = [];
    let totalAmount = 0;

    for (const item of items) {
      if (item.type === 'DIGITAL_KEY') {
        const game = await tx.game.findUnique({ where: { id: item.id } });
        if (!game || game.digitalPrice <= 0) throw new CommerceValidationError('The selected digital game is unavailable.');

        const stockKeys = safeJsonParse<string[]>(game.stockKeysJson, []);
        let keysForOrder: string[];
        let remainingKeys: string[];
        try {
          ({ delivered: keysForOrder, remaining: remainingKeys } = consumeDigitalKeys(stockKeys, item.quantity));
        } catch {
          throw new CommerceValidationError('Insufficient digital-key stock.');
        }
        await tx.game.update({
          where: { id: game.id },
          data: { stockKeysJson: JSON.stringify(remainingKeys) },
        });

        for (const key of keysForOrder) deliveredKeys.push({ gameTitle: game.title, key });

        totalAmount += game.digitalPrice * item.quantity;
        orderItemsData.push({
          game: { connect: { id: game.id } },
          name: `${game.title} (Digital Key)`,
          category: 'GAME_KEY',
          price: game.digitalPrice,
          quantity: item.quantity,
        });
      } else {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.price < 0) throw new CommerceValidationError('The selected product is unavailable.');
        if (product.stock < item.quantity) throw new CommerceValidationError('Insufficient physical stock.');

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });

        totalAmount += product.price * item.quantity;
        orderItemsData.push({
          product: { connect: { id: product.id } },
          name: product.name,
          category: product.category,
          price: product.price,
          quantity: item.quantity,
        });
      }
    }

    const order = await tx.order.create({
      data: {
        user: { connect: { id: session.user.id } },
        status: 'FULFILLED',
        totalAmount,
        deliveredKeysJson: JSON.stringify(deliveredKeys),
        items: { create: orderItemsData },
      },
    });

    return { orderId: order.id, totalAmount, deliveredKeys };
  });

  revalidatePath('/profile/orders');
  revalidatePath('/admin');
  revalidatePath('/store');
  return { success: true, ...result };
}