'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { safeJsonParse } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function fulfillMockOrder(items: any[], totalAmount: number) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = session.user.id;
  const deliveredKeys: { gameTitle: string; key: string }[] = [];
  const orderItemsData: any[] = [];

  // Transaction-like sequential processing
  for (const item of items) {
    if (item.type === 'DIGITAL_KEY') {
      const game = await prisma.game.findUnique({ where: { id: item.id } });
      if (!game) throw new Error(`Game not found: ${item.name}`);
      
      const stockKeys = safeJsonParse<string[]>(game.stockKeysJson, []);
      if (stockKeys.length === 0) throw new Error(`Out of keys for: ${game.title}`);
      
      // Pop a key
      const deliveredKey = stockKeys.pop() as string;
      
      await prisma.game.update({
        where: { id: game.id },
        data: { stockKeysJson: JSON.stringify(stockKeys) }
      });

      deliveredKeys.push({ gameTitle: game.title, key: deliveredKey });
      
      orderItemsData.push({
        gameId: game.id,
        name: `${game.title} (Digital Key)`,
        category: 'GAME_KEY',
        price: item.price,
        quantity: item.quantity,
      });

    } else if (item.type === 'PHYSICAL_GEAR') {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) throw new Error(`Product not found: ${item.name}`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for: ${product.name}`);

      await prisma.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity }
      });

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        price: item.price,
        quantity: item.quantity,
      });
    }
  }

  // Create Order
  const order = await prisma.order.create({
    data: {
      userId,
      status: 'FULFILLED',
      totalAmount,
      deliveredKeysJson: JSON.stringify(deliveredKeys),
      items: {
        create: orderItemsData
      }
    }
  });

  revalidatePath('/profile/orders');
  revalidatePath('/admin');
  revalidatePath('/store');
  
  return { success: true, orderId: order.id };
}
