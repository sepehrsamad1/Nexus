import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MetascoreBadge } from '@/components/MetascoreBadge';
import { VotingArrows } from '@/components/discussion/VotingArrows';
import { RootCommentForm } from '@/components/discussion/RootCommentForm';
import { CommentTree } from '@/components/discussion/CommentTree';
import { ReviewCommerceSidebar } from '@/components/store/ReviewCommerceSidebar';
import { safeJsonParse } from '@/lib/utils';
import { ArrowLeft, PlayCircle, Gamepad2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function buildTree(flatComments: any[]) {
  const commentMap = new Map();
  const roots: any[] = [];
  flatComments.forEach(c => commentMap.set(c.id, { ...c, replies: [] }));
  flatComments.forEach(c => {
    if (c.parentId) {
      const parent = commentMap.get(c.parentId);
      if (parent) parent.replies.push(commentMap.get(c.id));
    } else roots.push(commentMap.get(c.id));
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
      comments: { include: { author: true }, orderBy: { upvotes: 'desc' } }
    }
  });

  if (!review) notFound();

  const pros = safeJsonParse<string[]>(review.prosJson, []);
  const cons = safeJsonParse<string[]>(review.consJson, []);
  const commentTree = buildTree(review.comments);

  return (
    <main className="min-h-screen bg-zinc-950 pb-20">
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm font-medium text-zinc-400 overflow-x-auto whitespace-nowrap">
          <Link href="/community" className="hover:text-white flex items-center gap-1"><ArrowLeft className="w-4 h-4"/> Community</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/games/${review.game.slug}`} className="hover:text-white flex items-center gap-1"><Gamepad2 className="w-4 h-4"/> {review.game.title}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Review Thread</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Main Content (Review + Comments) */}
        <div className="flex-1 max-w-4xl">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8 shadow-2xl flex flex-col md:flex-row">
            <div className="bg-zinc-950/50 p-4 border-r border-zinc-800 hidden sm:flex flex-col items-center">
              <VotingArrows targetId={review.id} type="REVIEW" initialUpvotes={review.upvotes} initialDownvotes={review.downvotes} />
            </div>

            <div className="flex-1 p-6">
              <div className="flex items-center gap-3 mb-4">
                <img src={review.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.author.id}`} alt="Avatar" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-lg">{review.author.name}</span>
                    {review.roleAtCreation === 'STREAMER' && <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs font-black border border-purple-500/30 uppercase">Verified Streamer</span>}
                  </div>
                </div>
              </div>

              {review.videoUrl && (
                <div className="relative aspect-video bg-zinc-950 rounded-xl mb-6 overflow-hidden border border-zinc-800 group flex items-center justify-center">
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/30 mb-3"><PlayCircle className="w-8 h-8" /></div>
                  </div>
                  <div className="absolute top-4 left-4 z-10 shadow-2xl"><MetascoreBadge score={review.score} size="md" /></div>
                </div>
              )}
              
              <h1 className="text-2xl font-black text-white mb-4">{review.title}</h1>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed mb-6">{review.content}</p>
            </div>
          </div>

          <div className="pl-0 sm:pl-16">
            <RootCommentForm reviewId={review.id} gameId={review.gameId} />
            <h2 className="text-xl font-bold text-white mb-6">Comments ({review.comments.length})</h2>
            <CommentTree comments={commentTree} reviewAuthorId={review.authorId} reviewId={review.id} />
          </div>
        </div>

        {/* E-Commerce Sidebar Widget inserted into Review Thread */}
        <aside className="w-full lg:w-80 shrink-0">
          <ReviewCommerceSidebar gameId={review.gameId} authorId={review.authorId} />
        </aside>
      </div>
    </main>
  );
}
