'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { recalculateGameScores } from '@/lib/scoring';
import { reviewInputSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const pros = (formData.get('pros')?.toString() || '').split(',').map((s) => s.trim()).filter(Boolean);
  const cons = (formData.get('cons')?.toString() || '').split(',').map((s) => s.trim()).filter(Boolean);

  const parsed = reviewInputSchema.safeParse({
    gameId: formData.get('gameId')?.toString(),
    score: formData.get('score')?.toString(),
    title: formData.get('title')?.toString(),
    content: formData.get('content')?.toString(),
    videoUrl: formData.get('videoUrl')?.toString() || null,
    pros, cons,
  });
  if (!parsed.success) throw new Error('Invalid review input');

  const game = await prisma.game.findUnique({ where: { id: parsed.data.gameId }, select: { id: true } });
  if (!game) throw new Error('Game not found');

  try {
    await prisma.review.create({
      data: {
        gameId: parsed.data.gameId, authorId: session.user.id, roleAtCreation: session.user.role,
        score: parsed.data.score, title: parsed.data.title, content: parsed.data.content,
        videoUrl: parsed.data.videoUrl ?? null,
        prosJson: JSON.stringify(parsed.data.pros), consJson: JSON.stringify(parsed.data.cons),
      }
    });
    await recalculateGameScores(parsed.data.gameId);
  } catch (error) {
    console.error('Review submission failed', error instanceof Error ? error.message : 'unknown error');
    throw new Error('Unable to submit review');
  }

  revalidatePath(`/games/${parsed.data.gameId}`);
  revalidatePath('/games');
  return { success: true };
}
