'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath('/admin');
  return { success: true };
}
