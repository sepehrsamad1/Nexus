-- P11 curated 15-product gear catalog metadata
ALTER TABLE "Product" ADD COLUMN "imageSourceJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "rating" REAL NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "reviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "priceSource" TEXT;
ALTER TABLE "Product" ADD COLUMN "priceCheckedAt" DATETIME;
ALTER TABLE "Product" ADD COLUMN "sourceUrl" TEXT;
