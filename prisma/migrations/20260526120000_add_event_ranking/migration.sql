-- Add home placement ranking for upcoming events (paid slots + organic fallback)
ALTER TABLE "Event" ADD COLUMN "ranking" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Event_ranking_idx" ON "Event"("ranking");
