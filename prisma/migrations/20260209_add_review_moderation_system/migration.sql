-- CreateEnum
CREATE TYPE "BusinessPlan" AS ENUM ('FREE', 'BASIC', 'PREMIUM', 'SPONSOR');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'FLAGGED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "Business" DROP CONSTRAINT "Business_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ForumComment" DROP CONSTRAINT "ForumComment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "ForumPost" DROP CONSTRAINT "ForumPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropIndex
DROP INDEX "Business_department_idx";

-- DropIndex
DROP INDEX "Business_featured_idx";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "active",
DROP COLUMN "department",
DROP COLUMN "featured",
DROP COLUMN "logo",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "plan" "BusinessPlan" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "ranking" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tiktok" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reviewId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "acceptanceIp" TEXT,
ADD COLUMN     "acceptanceUa" TEXT,
ADD COLUMN     "contractAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "contractVersion" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "privacyVersion" TEXT,
ADD COLUMN     "termsVersion" TEXT;

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'VISIBLE',
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModerationLog_reviewId_idx" ON "ModerationLog"("reviewId");

-- CreateIndex
CREATE INDEX "ModerationLog_moderatorId_idx" ON "ModerationLog"("moderatorId");

-- CreateIndex
CREATE INDEX "ModerationLog_createdAt_idx" ON "ModerationLog"("createdAt");

-- CreateIndex
CREATE INDEX "ModerationLog_action_idx" ON "ModerationLog"("action");

-- CreateIndex
CREATE INDEX "Review_businessId_idx" ON "Review"("businessId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_businessId_userId_key" ON "Review"("businessId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE INDEX "Business_category_idx" ON "Business"("category");

-- CreateIndex
CREATE INDEX "Business_plan_idx" ON "Business"("plan");

-- CreateIndex
CREATE INDEX "Report_reviewId_idx" ON "Report"("reviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reviewId_reporterId_key" ON "Report"("reviewId", "reporterId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForumComment" ADD CONSTRAINT "ForumComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
