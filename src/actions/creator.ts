'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { canFollowCreator } from '@/lib/creator';
import { idSchema } from '@/lib/validation';
import { revalidatePath } from 'next/cache';

export async function toggleCreatorFollow(targetId: string) {
  const parsed = idSchema.safeParse(targetId);
  if (!parsed.success) throw new Error('Invalid creator');

  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const creator = await prisma.user.findUnique({
    where: { id: parsed.data },
    select: { id: true, role: true, creatorProfile: { select: { handle: true } } },
  });

  if (!creator || !creator.creatorProfile || !canFollowCreator(session.user.id, creator.id, creator.role)) {
    throw new Error('Only eligible creators can be followed');
  }

  const existing = await prisma.creatorFollow.findUnique({
    where: { followerId_followingId: { followerId: session.user.id, followingId: creator.id } },
  });

  if (existing) {
    await prisma.creatorFollow.delete({ where: { id: existing.id } });
  } else {
    await prisma.creatorFollow.create({
      data: { followerId: session.user.id, followingId: creator.id },
    });
  }

  revalidatePath('/creators');
  revalidatePath('/creators/' + creator.id);
  return { following: !existing };
}
