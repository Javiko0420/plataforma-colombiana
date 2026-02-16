-- CreateTable
CREATE TABLE "JobOffer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "externalLink" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobOffer_expiresAt_idx" ON "JobOffer"("expiresAt");

-- CreateIndex
CREATE INDEX "JobOffer_deletedAt_idx" ON "JobOffer"("deletedAt");

-- CreateIndex
CREATE INDEX "JobOffer_category_isVerified_idx" ON "JobOffer"("category", "isVerified");
