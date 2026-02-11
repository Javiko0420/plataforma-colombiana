-- AlterTable
ALTER TABLE "ForumComment" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ForumPost" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ForumComment_deletedAt_idx" ON "ForumComment"("deletedAt");

-- CreateIndex
CREATE INDEX "ForumPost_deletedAt_idx" ON "ForumPost"("deletedAt");
