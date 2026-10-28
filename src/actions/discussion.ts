'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function voteContent(targetId: string, type: 'REVIEW' | 'COMMENT', value: 1 | -1) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  try {
    const existingVote = await prisma.vote.findUnique({
      where: type === 'REVIEW' 
        ? { userId_reviewId: { userId, reviewId: targetId } }
        : { userId_commentId: { userId, commentId: targetId } }
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // User clicked same vote again (toggle off)
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await updateKarma(targetId, type, -value);
      } else {
        // Switched vote direction
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        });
        await updateKarma(targetId, type, value * 2); // Reverse old, add new
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          userId,
          value,
          ...(type === 'REVIEW' ? { reviewId: targetId } : { commentId: targetId })
        }
      });
      await updateKarma(targetId, type, value);
    }
    
    // Quick revalidate for the paths that might show this data
    revalidatePath('/reviews/[id]', 'page');
    revalidatePath('/community');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to vote' };
  }
}

async function updateKarma(targetId: string, type: 'REVIEW' | 'COMMENT', change: number) {
  if (type === 'REVIEW') {
    const field = change > 0 ? 'upvotes' : 'downvotes';
    await prisma.review.update({
      where: { id: targetId },
      data: { [field]: { increment: Math.abs(change) } }
    });
  } else {
    const field = change > 0 ? 'upvotes' : 'downvotes';
    await prisma.comment.update({
      where: { id: targetId },
      data: { [field]: { increment: Math.abs(change) } }
    });
  }
}

export async function createComment(data: { reviewId?: string, gameId?: string, parentId?: string, content: string }) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      authorId: session.user.id,
      reviewId: data.reviewId || null,
      gameId: data.gameId || null,
      parentId: data.parentId || null,
    }
  });

  if (data.reviewId) revalidatePath(`/reviews/${data.reviewId}`);
  if (data.gameId) revalidatePath(`/games/${data.gameId}`);
  
  return comment;
}
