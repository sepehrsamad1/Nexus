'use client';

import { moderateComment } from '@/actions/admin';
import { useState, useTransition } from 'react';

type ModerationComment = { id: string; content: string; author: { name: string }; game: { title: string } | null };

export function ModerationList({ comments }: { comments: ModerationComment[] }) {
  const [items, setItems] = useState(comments);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const hide = (comment: ModerationComment) => {
    if (!window.confirm('Hide this comment from the demo community? This is a soft-moderation state; no database row is destroyed.')) return;
    setPendingId(comment.id);
    setMessage('');
    startTransition(async () => {
      try {
        await moderateComment(comment.id);
        setItems(current => current.filter(item => item.id !== comment.id));
        setMessage('Comment hidden.');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to hide comment.');
      } finally { setPendingId(null); }
    });
  };

  if (!items.length) return <p className="text-sm text-zinc-500">No active comments require moderation.</p>;

  return (
    <div className="space-y-3">
      {items.map(comment => (
        <div key={comment.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-zinc-500">{comment.game?.title ?? 'Review discussion'} · {comment.author.name}</p>
              <p className="mt-2 text-sm text-zinc-300 line-clamp-3">{comment.content}</p>
            </div>
            <button type="button" onClick={() => hide(comment)} disabled={isPending} className="shrink-0 rounded-lg border border-rose-500/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">
              {pendingId === comment.id ? 'Hiding…' : 'Hide'}
            </button>
          </div>
        </div>
      ))}
      {message && <p className="text-xs text-zinc-500">{message}</p>}
    </div>
  );
}
