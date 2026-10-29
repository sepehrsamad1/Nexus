'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { idSchema, roleSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');

  const parsedId = idSchema.safeParse(userId);
  const parsedRole = roleSchema.safeParse(newRole);
  if (!parsedId.success || !parsedRole.success) throw new Error('Invalid role update');

  try {
    await prisma.user.update({ where: { id: parsedId.data }, data: { role: parsedRole.data } });
  } catch (error) {
    console.error('Admin role update failed', error instanceof Error ? error.message : 'unknown error');
    throw new Error('Unable to update user role');
  }

  revalidatePath('/admin');
  return { success: true };
}
