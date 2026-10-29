'use client';

import { useState } from 'react';
import { createComment } from '@/actions/discussion';
import { VotingArrows } from './VotingArrows';
import { MessageSquare, MinusSquare, PlusSquare, CornerDownRight } from 'lucide-react';

type CommentNode = {
  id: string;
  authorId: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date | string;
  parentId: string | null;
  author: { id: string; name: string; image: string | null; role: string };
  replies?: CommentNode[];
  initialUserVote?: 1 | -1 | 0;
};

interface CommentTreeProps {
  comments: CommentNode[];
  reviewAuthorId?: string;
  reviewId?: string;
  gameId?: string;
  depth?: number;
}

export function CommentTree({ comments, reviewAuthorId, reviewId, gameId, depth = 0 }: CommentTreeProps) {
  if (!comments || comments.length === 0) return null;

  return (
    <div className={`flex flex-col space-y-4 ${depth > 0 ? 'mt-4' : ''}`}>
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          reviewAuthorId={reviewAuthorId}
          reviewId={reviewId}
          gameId={gameId}
          depth={depth}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  reviewAuthorId,
  reviewId,
  gameId,
  depth,
}: {
  comment: CommentNode;
  reviewAuthorId?: string;
  reviewId?: string;
  gameId?: string;
  depth: number;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOP = comment.authorId === reviewAuthorId;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !replyText.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await createComment({
        reviewId,
        gameId,
        parentId: comment.id,
        content: replyText,
      });
      setReplyText('');
      setShowReplyForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to post reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3 text-sm relative group">
      <div className="flex flex-col items-center">
        <button
          type="button"
          aria-label={isCollapsed ? 'Expand thread' : 'Collapse thread'}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-1 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white bg-zinc-900 rounded border border-zinc-800 z-10"
        >
          {isCollapsed ? <PlusSquare className="w-3.5 h-3.5" /> : <MinusSquare className="w-3.5 h-3.5" />}
        </button>
        {!isCollapsed && comment.replies?.length ? (
          <div className="w-px h-full bg-zinc-800 group-hover:bg-zinc-600 mt-1 transition-colors" />
        ) : null}
      </div>

      <div className={`flex-1 min-w-0 ${isCollapsed ? 'opacity-60' : ''}`}>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex gap-4">
          <div className="shrink-0 mt-1">
            <VotingArrows
              targetId={comment.id}
              type="COMMENT"
              initialUpvotes={comment.upvotes}
              initialDownvotes={comment.downvotes}
              initialUserVote={comment.initialUserVote}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {comment.author.image ? (
                <img src={comment.author.image} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div aria-hidden="true" className="w-6 h-6 rounded-full bg-zinc-800" />
              )}
              <span className={`font-bold ${isOP ? 'text-purple-400' : 'text-zinc-200'}`}>
                {comment.author.name}
              </span>
              {isOP && (
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-black border border-purple-500/30">
                  AUTHOR
                </span>
              )}
              {comment.author.role === 'EXPERT' && !isOP && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                  EXPERT
                </span>
              )}
              {comment.author.role === 'STREAMER' && !isOP && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                  CREATOR
                </span>
              )}
              <time className="text-xs text-zinc-500 ml-auto" dateTime={new Date(comment.createdAt).toISOString()}>
                {new Date(comment.createdAt).toLocaleString()}
              </time>
            </div>

            {!isCollapsed && (
              <>
                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                  </button>
                </div>
                {showReplyForm && (
                  <form onSubmit={handleReply} className="mt-4 flex gap-3 items-start">
                    <CornerDownRight className="w-5 h-5 text-zinc-600 shrink-0 mt-2" />
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Join the discussion…"
                          maxLength={5000}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none min-h-[80px]"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting || !replyText.trim()}
                          className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? 'Posting…' : 'Post'}
                        </button>
                      </div>
                      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {!isCollapsed && comment.replies?.length ? (
          <div className="ml-2 pl-4">
            <CommentTree
              comments={comment.replies}
              reviewAuthorId={reviewAuthorId}
              reviewId={reviewId}
              gameId={gameId}
              depth={depth + 1}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
