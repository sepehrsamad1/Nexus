CREATE TABLE "ExternalReference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "externalId" TEXT,
  "source" TEXT NOT NULL,
  "sourceUrl" TEXT NOT NULL,
  "canonicalUrl" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT,
  "authorDisplayName" TEXT,
  "publishedAt" DATETIME,
  "retrievedAt" DATETIME NOT NULL,
  "attribution" TEXT NOT NULL,
  "metadataJson" TEXT NOT NULL DEFAULT '{}',
  "isDemoEditorial" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "ExternalReference_source_externalId_key" ON "ExternalReference"("source", "externalId");
CREATE INDEX "ExternalReference_entityType_entityId_kind_retrievedAt_idx" ON "ExternalReference"("entityType", "entityId", "kind", "retrievedAt");
