-- AlterTable
ALTER TABLE "Event" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "eventId" TEXT;

-- CreateIndex
CREATE INDEX "Event_isHidden_idx" ON "Event"("isHidden");

-- CreateIndex
CREATE INDEX "Report_eventId_idx" ON "Report"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_eventId_reporterId_key" ON "Report"("eventId", "reporterId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
