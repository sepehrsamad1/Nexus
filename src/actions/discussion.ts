'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { commentInputSchema, voteInputSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function voteContent(targetId: string, type: 'REVIEW' | 'COMMENT', value: 1 | -1) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = voteInputSchema.safeParse({ targetId, type, value });
  if (!parsed.success) return { error: 'Invalid vote input' };

  try {
    const existingVote = await prisma.vote.findUnique({
      where: type === 'REVIEW' ? { userId_reviewId: { userId: session.user.id, reviewId: targetId } } : { userId_commentId: { userId: session.user.id, commentId: targetId } }
    });

    if (existingVote) {
      if (existingVote.value === value) {
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await updateKarma(targetId, type, -value);
      } else {
        await prisma.vote.update({ where: { id: existingVote.id }, data: { value } });
        await updateKarma(targetId, type, value * 2);
      }
    } else {
      await prisma.vote.create({ data: { userId: session.user.id, value, ...(type === 'REVIEW' ? { reviewId: targetId } : { commentId: targetId }) } });
      await updateKarma(targetId, type, value);
    }

    revalidatePath('/reviews/[id]', 'page');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error('Vote failed', error instanceof Error ? error.message : 'unknown error');
    return { error: 'Failed to vote' };
  }
}

async function updateKarma(targetId: string, type: 'REVIEW' | 'COMMENT', change: number) {
  const field = change > 0 ? 'upvotes' : 'downvotes';
  if (type === 'REVIEW') {
    await prisma.review.update({ where: { id: targetId }, data: { [field]: { increment: Math.abs(change) } } });
  } else {
    await prisma.comment.update({ where: { id: targetId }, data: { [field]: { increment: Math.abs(change) } } });
  }
}

export async function createComment(data: { reviewId?: string, gameId?: string, parentId?: string, content: string }) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const parsed = commentInputSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid comment input');

  const { reviewId, gameId, parentId, content } = parsed.data;
  if (reviewId && !(await prisma.review.findUnique({ where: { id: reviewId }, select: { id: true } }))) throw new Error('Review not found');
  if (gameId && !(await prisma.game.findUnique({ where: { id: gameId }, select: { id: true } }))) throw new Error('Game not found');

  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId }, select: { id: true, reviewId: true, gameId: true } });
    if (!parent) throw new Error('Parent comment not found');
    if (reviewId && parent.reviewId !== reviewId) throw new Error('Invalid parent comment');
    if (gameId && parent.gameId !== gameId) throw new Error('Invalid parent comment');
  }

  try {
    const comment = await prisma.comment.create({ data: { content, authorId: session.user.id, reviewId: reviewId || null, gameId: gameId || null, parentId: parentId || null } });
    if (reviewId) revalidatePath(`/reviews/${reviewId}`);
    if (gameId) revalidatePath(`/games/${gameId}`);
    return comment;
  } catch (error) {
    console.error('Comment creation failed', error instanceof Error ? error.message : 'unknown error');
    throw new Error('Unable to create comment');
  }
}
