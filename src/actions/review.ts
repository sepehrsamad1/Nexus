'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { recalculateGameScores } from '@/lib/scoring';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const gameId = formData.get('gameId') as string;
  const score = parseInt(formData.get('score') as string, 10);
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  
  const videoUrl = formData.get('videoUrl') as string | null;
  const pros = (formData.get('pros') as string || '').split(',').map(s => s.trim()).filter(Boolean);
  const cons = (formData.get('cons') as string || '').split(',').map(s => s.trim()).filter(Boolean);

  if (isNaN(score) || score < 0 || score > 100) throw new Error("Invalid score");

  await prisma.review.create({
    data: {
      gameId,
      authorId: session.user.id,
      roleAtCreation: session.user.role,
      score,
      title,
      content,
      videoUrl: videoUrl || null,
      prosJson: JSON.stringify(pros),
      consJson: JSON.stringify(cons),
    }
  });

  await recalculateGameScores(gameId);
  revalidatePath(`/games/${gameId}`);
  revalidatePath('/games');
  
  return { success: true };
}
