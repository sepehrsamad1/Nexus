'use client';

import { useState } from 'react';
import { submitReview } from '@/actions/review';
import { X, Star, Video } from 'lucide-react';
import type { Role } from '@/lib/validation';

interface ReviewModalProps {
  gameId: string;
  gameTitle: string;
  userRole: Role;
}

export function ReviewModal({ gameId, gameTitle, userRole }: ReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('gameId', gameId);
    
    await submitReview(formData);
    
    setIsSubmitting(false);
    setIsOpen(false);
    window.location.reload(); // Quick refresh to show new review
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
      >
        <Star className="w-5 h-5" />
        Rate & Review {userRole === 'STREAMER' ? ' (Add VOD)' : ''}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
              <h2 className="text-xl font-bold">Review {gameTitle}</h2>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Score (0-100)</label>
                <input 
                  type="number" 
                  name="score" 
                  min="0" max="100" 
                  required 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 text-2xl font-black text-center"
                  placeholder="85"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Headline</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="A masterpiece, but flawed..."
                />
              </div>

              {(userRole === 'STREAMER' || userRole === 'EXPERT') && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-400 mb-2">Pros (comma separated)</label>
                      <input type="text" name="pros" className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" placeholder="Great combat, Graphics" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-rose-400 mb-2">Cons (comma separated)</label>
                      <input type="text" name="cons" className="w-full bg-rose-950/20 border border-rose-900/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-rose-500" placeholder="Short story, Bugs" />
                    </div>
                  </div>
                </>
              )}

              {userRole === 'STREAMER' && (
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-2 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Twitch/YouTube VOD URL
                  </label>
                  <input 
                    type="url" 
                    name="videoUrl" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Full Review</label>
                <textarea 
                  name="content" 
                  required 
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Share your thoughts..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
