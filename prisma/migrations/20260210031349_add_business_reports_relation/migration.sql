-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "businessId" TEXT;

-- CreateIndex
CREATE INDEX "Report_businessId_idx" ON "Report"("businessId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
