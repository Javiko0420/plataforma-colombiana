-- CreateTable
CREATE TABLE "FavoriteStation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "streamUrl" TEXT NOT NULL,
    "homepage" TEXT,
    "logoUrl" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "language" TEXT,
    "codec" TEXT,
    "bitrate" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavoriteStation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteStation_userId_idx" ON "FavoriteStation"("userId");

-- CreateIndex
CREATE INDEX "FavoriteStation_userId_createdAt_idx" ON "FavoriteStation"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteStation_userId_stationId_key" ON "FavoriteStation"("userId", "stationId");

-- AddForeignKey
ALTER TABLE "FavoriteStation" ADD CONSTRAINT "FavoriteStation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
