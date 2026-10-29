'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { commentInputSchema, voteInputSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

type VoteTarget = 'REVIEW' | 'COMMENT';

export async function voteContent(targetId: string, type: VoteTarget, value: 1 | -1) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const parsed = voteInputSchema.safeParse({ targetId, type, value });
  if (!parsed.success) return { error: 'Invalid vote input' };

  try {
    const result = await prisma.$transaction(async tx => {
      const target = type === 'REVIEW'
        ? await tx.review.findUnique({ where: { id: targetId }, select: { id: true } })
        : await tx.comment.findUnique({ where: { id: targetId }, select: { id: true, isDeleted: true } });

      if (!target || ('isDeleted' in target && target.isDeleted)) {
        return { error: 'Discussion target not found' };
      }

      const existingVote = type === 'REVIEW'
        ? await tx.vote.findUnique({
            where: { userId_reviewId: { userId: session.user.id, reviewId: targetId } },
          })
        : await tx.vote.findUnique({
            where: { userId_commentId: { userId: session.user.id, commentId: targetId } },
          });

      if (existingVote) {
        if (existingVote.value === value) {
          await tx.vote.delete({ where: { id: existingVote.id } });
          if (type === 'REVIEW') {
            await tx.review.update({
              where: { id: targetId },
              data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
            });
          } else {
            await tx.comment.update({
              where: { id: targetId },
              data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
            });
          }
          return { success: true, following: false, state: 0 as const };
        }

        await tx.vote.update({ where: { id: existingVote.id }, data: { value } });
        if (type === 'REVIEW') {
          await tx.review.update({
            where: { id: targetId },
            data: value === 1
              ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
              : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
          });
        } else {
          await tx.comment.update({
            where: { id: targetId },
            data: value === 1
              ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
              : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
          });
        }
        return { success: true, state: value };
      }

      await tx.vote.create({
        data: {
          userId: session.user.id,
          value,
          ...(type === 'REVIEW' ? { reviewId: targetId } : { commentId: targetId }),
        },
      });

      if (type === 'REVIEW') {
        await tx.review.update({
          where: { id: targetId },
          data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
        });
      } else {
        await tx.comment.update({
          where: { id: targetId },
          data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
        });
      }

      return { success: true, state: value };
    });

    if ('error' in result) return result;
    revalidatePath('/community');
    revalidatePath('/games');
    revalidatePath('/games/[slug]', 'page');
    revalidatePath('/reviews/[id]', 'page');
    return result;
  } catch (error) {
    console.error('Vote failed', error instanceof Error ? error.message : 'unknown error');
    return { error: 'Failed to record vote' };
  }
}

export async function createComment(data: { reviewId?: string; gameId?: string; parentId?: string; content: string }) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const parsed = commentInputSchema.safeParse(data);
  if (!parsed.success) throw new Error('Invalid comment input');

  const { reviewId, gameId, parentId, content } = parsed.data;

  try {
    const comment = await prisma.$transaction(async tx => {
      if (reviewId) {
        const review = await tx.review.findUnique({ where: { id: reviewId }, select: { id: true, gameId: true } });
        if (!review) throw new Error('Review not found');
        if (parentId) {
          const parent = await tx.comment.findUnique({
            where: { id: parentId },
            select: { id: true, reviewId: true, gameId: true, isDeleted: true },
          });
          if (!parent || parent.isDeleted || parent.reviewId !== reviewId || parent.gameId !== null) {
            throw new Error('Invalid parent comment');
          }
        }
      }

      if (gameId) {
        const game = await tx.game.findUnique({ where: { id: gameId }, select: { id: true } });
        if (!game) throw new Error('Game not found');
        if (parentId) {
          const parent = await tx.comment.findUnique({
            where: { id: parentId },
            select: { id: true, reviewId: true, gameId: true, isDeleted: true },
          });
          if (!parent || parent.isDeleted || parent.gameId !== gameId || parent.reviewId !== null) {
            throw new Error('Invalid parent comment');
          }
        }
      }

      const created = await tx.comment.create({
        data: {
          content,
          authorId: session.user.id,
          reviewId: reviewId || null,
          gameId: gameId || null,
          parentId: parentId || null,
        },
      });

      if (gameId) {
        await tx.game.update({
          where: { id: gameId },
          data: { discussionCount: { increment: 1 } },
        });
      }

      return created;
    });

    if (reviewId) revalidatePath(`/reviews/${reviewId}`);
    if (gameId) {
      revalidatePath(`/games/${gameId}`);
      revalidatePath('/community');
    }
    return comment;
  } catch (error) {
    console.error('Comment creation failed', error instanceof Error ? error.message : 'unknown error');
    throw new Error(error instanceof Error ? error.message : 'Unable to create comment');
  }
}
