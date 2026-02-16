/*
  Warnings:

  - Added the required column `userId` to the `JobOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobOffer" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "JobOffer_userId_idx" ON "JobOffer"("userId");

-- AddForeignKey
ALTER TABLE "JobOffer" ADD CONSTRAINT "JobOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
