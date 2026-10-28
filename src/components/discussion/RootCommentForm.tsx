'use client';

import { useState } from 'react';
import { createComment } from '@/actions/discussion';
import { MessageSquare } from 'lucide-react';

export function RootCommentForm({ reviewId, gameId }: { reviewId?: string, gameId?: string }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    await createComment({ reviewId, gameId, content });
    setContent('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3 text-zinc-400">
        <MessageSquare className="w-5 h-5" />
        <span className="font-bold">Add a comment</span>
      </div>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What are your thoughts on this review?"
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-white focus:outline-none focus:border-indigo-500 resize-none min-h-[100px] mb-3"
        required
      />
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
