-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('SUMMARY', 'TAKEAWAYS', 'FLASHCARDS', 'QUIZ', 'MINDMAP', 'REPORT');

-- CreateEnum
CREATE TYPE "ArtifactStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "learning_artifact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "sourceIds" TEXT[],
    "status" "ArtifactStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_artifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "learning_artifact_workspaceId_idx" ON "learning_artifact"("workspaceId");

-- CreateIndex
CREATE INDEX "learning_artifact_workspaceId_type_idx" ON "learning_artifact"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "learning_artifact_workspaceId_status_idx" ON "learning_artifact"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "learning_artifact" ADD CONSTRAINT "learning_artifact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
