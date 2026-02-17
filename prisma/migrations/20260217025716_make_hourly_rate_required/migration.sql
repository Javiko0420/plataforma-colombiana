-- Backfill: assign default hourly rate to existing records with NULL
UPDATE "JobOffer" SET "hourlyRate" = 0 WHERE "hourlyRate" IS NULL;

-- AlterTable
ALTER TABLE "JobOffer" ALTER COLUMN "hourlyRate" SET NOT NULL;
