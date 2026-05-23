-- CreateTable
CREATE TABLE "SportsStandingsCache" (
    "id" TEXT NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SportsStandingsCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SportsStandingsCache_leagueId_season_key" ON "SportsStandingsCache"("leagueId", "season");

-- CreateIndex
CREATE INDEX "SportsStandingsCache_fetchedAt_idx" ON "SportsStandingsCache"("fetchedAt");
