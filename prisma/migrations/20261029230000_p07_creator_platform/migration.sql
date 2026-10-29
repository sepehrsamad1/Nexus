CREATE TABLE "CreatorProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "handle" TEXT NOT NULL,
  "tagline" TEXT,
  "bio" TEXT,
  "isDemoEditorial" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CreatorPost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreatorPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CreatorFollow" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreatorFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CreatorFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");
CREATE UNIQUE INDEX "CreatorProfile_handle_key" ON "CreatorProfile"("handle");
CREATE INDEX "CreatorPost_authorId_createdAt_idx" ON "CreatorPost"("authorId", "createdAt");
CREATE UNIQUE INDEX "CreatorFollow_followerId_followingId_key" ON "CreatorFollow"("followerId", "followingId");
CREATE INDEX "CreatorFollow_followingId_createdAt_idx" ON "CreatorFollow"("followingId", "createdAt");
