'use client';

import { useState, useTransition } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { voteContent } from '@/actions/discussion';
import { cn } from '@/lib/utils';

interface VotingArrowsProps {
  targetId: string;
  type: 'REVIEW' | 'COMMENT';
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: 1 | -1 | 0;
}

export function VotingArrows({
  targetId,
  type,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = 0,
}: VotingArrowsProps) {
  const [netKarma, setNetKarma] = useState(initialUpvotes - initialDownvotes);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(initialUserVote);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleVote = (val: 1 | -1) => {
    if (isPending) return;
    setError(null);

    const previousVote = userVote;
    const nextVote: 1 | -1 | 0 = previousVote === val ? 0 : val;
    const nextKarma = netKarma - previousVote + nextVote;

    setUserVote(nextVote);
    setNetKarma(nextKarma);

    startTransition(async () => {
      const result = await voteContent(targetId, type, val);
      if (result?.error) {
        setUserVote(previousVote);
        setNetKarma(netKarma);
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center bg-zinc-900/50 rounded-lg border border-zinc-800 p-1">
        <button
          type="button"
          aria-label="Upvote"
          aria-pressed={userVote === 1}
          disabled={isPending}
          onClick={() => handleVote(1)}
          className={cn(
            'p-1 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50',
            userVote === 1 ? 'text-amber-500' : 'text-zinc-500 hover:text-amber-400',
          )}
        >
          <ArrowUp className="w-5 h-5" strokeWidth={userVote === 1 ? 3 : 2} />
        </button>
        <span className={cn(
          'text-xs font-bold font-mono my-1',
          userVote === 1 ? 'text-amber-500' : userVote === -1 ? 'text-indigo-400' : 'text-zinc-400',
        )}>
          {netKarma > 0 ? '+' : ''}{netKarma}
        </span>
        <button
          type="button"
          aria-label="Downvote"
          aria-pressed={userVote === -1}
          disabled={isPending}
          onClick={() => handleVote(-1)}
          className={cn(
            'p-1 rounded hover:bg-zinc-800 transition-colors disabled:opacity-50',
            userVote === -1 ? 'text-indigo-500' : 'text-zinc-500 hover:text-indigo-400',
          )}
        >
          <ArrowDown className="w-5 h-5" strokeWidth={userVote === -1 ? 3 : 2} />
        </button>
      </div>
      {error && <span className="mt-1 max-w-24 text-center text-[10px] text-rose-400">{error}</span>}
    </div>
  );
}
