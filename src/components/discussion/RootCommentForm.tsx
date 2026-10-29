'use client';

import { useState } from 'react';
import { createComment } from '@/actions/discussion';
import { MessageSquare } from 'lucide-react';

export function RootCommentForm({ reviewId, gameId }: { reviewId?: string; gameId?: string }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createComment({ reviewId, gameId, content });
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <MessageSquare className="w-5 h-5" />
        <span className="font-bold">{reviewId ? 'Join the review discussion' : 'Start a game discussion'}</span>
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={reviewId ? 'What are your thoughts on this review?' : 'Start a respectful discussion about this game…'}
        maxLength={5000}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-indigo-500 resize-none min-h-[100px] mb-3"
        required
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-600">Be respectful. Demo content is clearly labeled.</span>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Posting…' : reviewId ? 'Comment' : 'Post discussion'}
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}
    </form>
  );
}
