'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { idSchema, roleSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { recalculateGameScores } from '@/lib/scoring';

async function requireAdmin() {
  const session = await getSession();
  if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');
  return session.user;
}

export async function updateUserRole(userId: string, newRole: string) {
  const sessionUser = await requireAdmin();
  const parsedId = idSchema.safeParse(userId);
  const parsedRole = roleSchema.safeParse(newRole);
  if (!parsedId.success || !parsedRole.success) throw new Error('Invalid role update');
  if (parsedId.data === sessionUser.id && parsedRole.data !== 'ADMIN') {
    throw new Error('You cannot remove your own admin role from the demo portal.');
  }

  try {
    if (parsedRole.data !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const target = await prisma.user.findUnique({ where: { id: parsedId.data }, select: { role: true } });
      if (target?.role === 'ADMIN' && adminCount <= 1) throw new Error('At least one admin must remain.');
    }
    await prisma.user.update({ where: { id: parsedId.data }, data: { role: parsedRole.data } });
  } catch (error) {
    console.error('Admin role update failed', error instanceof Error ? error.message : 'unknown error');
    throw new Error(error instanceof Error ? error.message : 'Unable to update user role');
  }

  revalidatePath('/admin');
  revalidatePath('/profile');
  revalidatePath('/creators');
  return { success: true };
}

export async function moderateComment(commentId: string) {
  await requireAdmin();
  const parsedId = idSchema.safeParse(commentId);
  if (!parsedId.success) throw new Error('Invalid comment id');
  try {
    await prisma.comment.update({ where: { id: parsedId.data }, data: { isDeleted: true } });
  } catch (error) {
    console.error('Admin moderation failed', error instanceof Error ? error.message : 'unknown error');
    throw new Error('Unable to hide this comment');
  }
  revalidatePath('/admin');
  revalidatePath('/community');
  revalidatePath('/games');
  revalidatePath('/games/[slug]', 'page');
  revalidatePath('/reviews/[id]', 'page');
  return { success: true };
}

export async function recalculateDemoScores(confirmation: string) {
  await requireAdmin();
  if (confirmation !== 'CONFIRM') throw new Error('Confirmation required.');
  const games = await prisma.game.findMany({ select: { id: true } });
  for (const game of games) await recalculateGameScores(game.id);
  revalidatePath('/');
  revalidatePath('/games');
  revalidatePath('/community');
  revalidatePath('/admin');
  return { success: true, count: games.length };
}
