import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { VotingArrows } from '@/components/discussion/VotingArrows';
import { RootCommentForm } from '@/components/discussion/RootCommentForm';
import { CommentTree } from '@/components/discussion/CommentTree';
import { safeJsonParse } from '@/lib/utils';
import { ArrowLeft, PlayCircle, Gamepad2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Recursive helper to build nested comment tree from flat Prisma results
// (Prisma doesn't easily do infinite recursion in one findMany, so we fetch all for this review and build the tree in JS)
function buildTree(flatComments: any[]) {
  const commentMap = new Map();
  const roots: any[] = [];

  flatComments.forEach(c => {
    commentMap.set(c.id, { ...c, replies: [] });
  });

  flatComments.forEach(c => {
    if (c.parentId) {
      const parent = commentMap.get(c.parentId);
      if (parent) parent.replies.push(commentMap.get(c.id));
    } else {
      roots.push(commentMap.get(c.id));
    }
  });

  return roots;
}

export default async function ReviewThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      game: true,
      author: true,
      comments: {
        include: { author: true },
        orderBy: { upvotes: 'desc' } // Initial sort by upvotes
      }
    }
  });

  if (!review) notFound();

  const pros = safeJsonParse<string[]>(review.prosJson, []);
  const cons = safeJsonParse<string[]>(review.consJson, []);
  const commentTree = buildTree(review.comments);

  return (
    <main className="min-h-screen bg-zinc-950 pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2 text-sm font-medium text-zinc-400 overflow-x-auto whitespace-nowrap">
          <Link href="/community" className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Community</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/games/${review.game.slug}`} className="hover:text-white flex items-center gap-1"><Gamepad2 className="w-4 h-4"/> {review.game.title}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Review Thread</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Main Original Post (The Review) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8 shadow-2xl flex flex-col md:flex-row">
          {/* Left Voting Column */}
          <div className="bg-zinc-950/50 p-4 border-r border-zinc-800 hidden sm:flex flex-col items-center">
            <VotingArrows targetId={review.id} type="REVIEW" initialUpvotes={review.upvotes} initialDownvotes={review.downvotes} />
          </div>

          {/* Review Content */}
          <div className="flex-1 p-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={review.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author.id}`} alt="Avatar" className="w-10 h-10 rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-lg">{review.author.name}</span>
                  {review.roleAtCreation === 'STREAMER' && <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-black border border-purple-500/30 uppercase">Verified Streamer</span>}
                  {review.roleAtCreation === 'EXPERT' && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30 uppercase">Verified Expert</span>}
                </div>
                <div className="text-zinc-500 text-sm">Reviewed <Link href={`/games/${review.game.slug}`} className="text-indigo-400 hover:underline">{review.game.title}</Link></div>
              </div>
            </div>

            {/* VOD Embed Placeholder */}
            {review.videoUrl && (
              <div className="relative aspect-video bg-zinc-950 rounded-xl mb-6 overflow-hidden border border-zinc-800 group flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={review.game.bannerImage || review.game.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="VOD Thumbnail" />
                <div className="z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 mb-3 cursor-pointer group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8" />
                  </div>
                  <span className="font-mono text-rose-400 text-sm bg-zinc-950/80 px-3 py-1 rounded-md">{review.videoUrl}</span>
                </div>
                <div className="absolute top-4 left-4 z-10 shadow-2xl">
                  <MetascoreBadge score={review.score} size="md" />
                </div>
              </div>
            )}

            {!review.videoUrl && (
              <div className="mb-6 flex items-start justify-between">
                 <h1 className="text-2xl font-black text-white">{review.title}</h1>
                 <MetascoreBadge score={review.score} size="md" />
              </div>
            )}

            {review.videoUrl && <h1 className="text-2xl font-black text-white mb-4">{review.title}</h1>}
            
            <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed mb-6">{review.content}</p>

            {(pros.length > 0 || cons.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
                {pros.length > 0 && (
                  <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4">
                    <h4 className="text-emerald-500 font-bold mb-2">Pros</h4>
                    <ul className="list-disc pl-5 text-zinc-300 text-sm space-y-1">
                      {pros.map(p => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {cons.length > 0 && (
                  <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-4">
                    <h4 className="text-rose-500 font-bold mb-2">Cons</h4>
                    <ul className="list-disc pl-5 text-zinc-300 text-sm space-y-1">
                      {cons.map(c => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Discussion Section */}
        <div className="pl-0 sm:pl-16">
          <RootCommentForm reviewId={review.id} gameId={review.gameId} />
          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              All Comments <span className="text-zinc-500 text-sm font-normal">({review.comments.length})</span>
            </h2>
            <select className="bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500">
              <option>Sort by: Best</option>
              <option>Sort by: Top</option>
              <option>Sort by: New</option>
              <option>Sort by: Controversial</option>
            </select>
          </div>

          <CommentTree comments={commentTree} reviewAuthorId={review.authorId} reviewId={review.id} />
          
          {review.comments.length === 0 && (
            <div className="text-center py-12 text-zinc-500">
              No one has commented yet. Be the first!
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
