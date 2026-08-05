-- CreateTable
CREATE TABLE "source_chunk" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_chunk_sourceId_idx" ON "source_chunk"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "source_chunk_sourceId_index_key" ON "source_chunk"("sourceId", "index");

-- AddForeignKey
ALTER TABLE "source_chunk" ADD CONSTRAINT "source_chunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
