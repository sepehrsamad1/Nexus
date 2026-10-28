'use client';

import { useState } from 'react';
import { createComment } from '@/actions/discussion';
import { VotingArrows } from './VotingArrows';
import { MessageSquare, MinusSquare, PlusSquare, CornerDownRight } from 'lucide-react';

// Using loosely typed any here because deeply nested Prisma include trees can get complex
// In production, we'd use Prisma.CommentGetPayload
type CommentNode = any; 

interface CommentTreeProps {
  comments: CommentNode[];
  reviewAuthorId?: string;
  reviewId?: string;
  depth?: number;
}

export function CommentTree({ comments, reviewAuthorId, reviewId, depth = 0 }: CommentTreeProps) {
  if (!comments || comments.length === 0) return null;

  return (
    <div className={`flex flex-col space-y-4 ${depth > 0 ? 'mt-4' : ''}`}>
      {comments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          reviewAuthorId={reviewAuthorId} 
          reviewId={reviewId} 
          depth={depth} 
        />
      ))}
    </div>
  );
}

function CommentItem({ comment, reviewAuthorId, reviewId, depth }: { comment: CommentNode, reviewAuthorId?: string, reviewId?: string, depth: number }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Author Flair Logic
  let authorRole = comment.author.role;
  let isOP = comment.authorId === reviewAuthorId;

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    await createComment({
      reviewId: reviewId,
      parentId: comment.id,
      content: replyText,
    });
    setReplyText("");
    setShowReplyForm(false);
    setIsSubmitting(false);
  };

  return (
    <div className="flex gap-3 text-sm relative group">
      {/* Interactive Vertical Thread Line */}
      <div className="flex flex-col items-center">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-1 w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white bg-zinc-900 rounded border border-zinc-800 z-10"
        >
          {isCollapsed ? <PlusSquare className="w-3.5 h-3.5" /> : <MinusSquare className="w-3.5 h-3.5" />}
        </button>
        {!isCollapsed && comment.replies?.length > 0 && (
          <div 
            className="w-px h-full bg-zinc-800 group-hover:bg-zinc-600 cursor-pointer mt-1 transition-colors" 
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </div>

      {/* Comment Body */}
      <div className={`flex-1 ${isCollapsed ? 'opacity-60' : ''}`}>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex gap-4">
          <div className="shrink-0 mt-1">
            <VotingArrows targetId={comment.id} type="COMMENT" initialUpvotes={comment.upvotes} initialDownvotes={comment.downvotes} />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Meta Header */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <img src={comment.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.id}`} alt="Avatar" className="w-5 h-5 rounded-full" />
              <span className={`font-bold ${isOP ? 'text-purple-400' : 'text-zinc-300'}`}>
                {comment.author.name}
              </span>
              
              {/* Flairs */}
              {isOP && <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-black border border-purple-500/30">REVIEW AUTHOR</span>}
              {!isOP && authorRole === 'EXPERT' && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">VERIFIED EXPERT</span>}
              {!isOP && authorRole === 'STREAMER' && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">STREAMER</span>}
              
              <span className="text-xs text-zinc-500 ml-auto">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Content */}
            {!isCollapsed && (
              <>
                <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                
                {/* Actions */}
                <div className="flex items-center gap-4 mt-3">
                  <button 
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                  </button>
                </div>

                {/* Reply Form */}
                {showReplyForm && (
                  <form onSubmit={handleReply} className="mt-4 flex gap-3 items-start relative">
                    <CornerDownRight className="w-5 h-5 text-zinc-600 shrink-0 mt-2" />
                    <div className="flex-1 flex gap-2">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="What are your thoughts?"
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none min-h-[80px]"
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recursive Children (Rendered conditionally based on collapse state) */}
        {!isCollapsed && comment.replies && comment.replies.length > 0 && (
          <div className="ml-2 pl-4 border-l border-transparent">
            <CommentTree comments={comment.replies} reviewAuthorId={reviewAuthorId} reviewId={reviewId} depth={depth + 1} />
          </div>
        )}
      </div>
    </div>
  );
}
