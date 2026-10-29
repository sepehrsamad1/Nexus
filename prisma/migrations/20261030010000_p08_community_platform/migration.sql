-- P08 community discussion query indexes
CREATE INDEX "Comment_gameId_parentId_createdAt_idx" ON "Comment"("gameId", "parentId", "createdAt");
CREATE INDEX "Comment_reviewId_parentId_createdAt_idx" ON "Comment"("reviewId", "parentId", "createdAt");
