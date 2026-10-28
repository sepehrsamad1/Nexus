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
}

export function VotingArrows({ targetId, type, initialUpvotes, initialDownvotes }: VotingArrowsProps) {
  const [netKarma, setNetKarma] = useState(initialUpvotes - initialDownvotes);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0); // 0 = no vote in local state
  const [isPending, startTransition] = useTransition();

  const handleVote = (val: 1 | -1) => {
    if (isPending) return;
    
    // Optimistic UI update
    let newKarma = netKarma;
    let newVote: 1 | -1 | 0 = val;

    if (userVote === val) {
      newKarma -= val;
      newVote = 0;
    } else {
      if (userVote !== 0) newKarma -= userVote; // Remove old vote
      newKarma += val; // Add new vote
    }

    setNetKarma(newKarma);
    setUserVote(newVote);

    // Server request
    startTransition(async () => {
      await voteContent(targetId, type, val);
    });
  };

  return (
    <div className="flex flex-col items-center bg-zinc-900/50 rounded-lg border border-zinc-800 p-1">
      <button 
        onClick={() => handleVote(1)}
        className={cn("p-1 rounded hover:bg-zinc-800 transition-colors", userVote === 1 ? "text-amber-500" : "text-zinc-500 hover:text-amber-400")}
      >
        <ArrowUp className="w-5 h-5" strokeWidth={userVote === 1 ? 3 : 2} />
      </button>
      
      <span className={cn("text-xs font-bold font-mono my-1", userVote === 1 ? "text-amber-500" : userVote === -1 ? "text-indigo-400" : "text-zinc-400")}>
        {netKarma > 0 ? '+' : ''}{netKarma}
      </span>
      
      <button 
        onClick={() => handleVote(-1)}
        className={cn("p-1 rounded hover:bg-zinc-800 transition-colors", userVote === -1 ? "text-indigo-500" : "text-zinc-500 hover:text-indigo-400")}
      >
        <ArrowDown className="w-5 h-5" strokeWidth={userVote === -1 ? 3 : 2} />
      </button>
    </div>
  );
}
