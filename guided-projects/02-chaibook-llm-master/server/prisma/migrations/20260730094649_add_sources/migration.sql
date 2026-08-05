-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PDF', 'WEBSITE', 'YOUTUBE', 'TEXT', 'MARKDOWN');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "source" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_workspaceId_idx" ON "source"("workspaceId");

-- CreateIndex
CREATE INDEX "source_workspaceId_type_idx" ON "source"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "source_workspaceId_status_idx" ON "source"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "source" ADD CONSTRAINT "source_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
