'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleCreatorFollow } from '@/actions/creator';

export function CreatorFollowButton({
  creatorId,
  initialFollowing,
}: {
  creatorId: string;
  initialFollowing: boolean;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      try {
        const result = await toggleCreatorFollow(creatorId);
        setFollowing(result.following);
        router.refresh();
      } catch {
        // Keep the previous state on authorization or server errors.
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-black text-white transition hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Updating…' : following ? 'Following' : 'Follow Creator'}
    </button>
  );
}
