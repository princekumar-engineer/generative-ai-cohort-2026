-- AlterTable
ALTER TABLE "conversation" ADD COLUMN "summary" TEXT,
ADD COLUMN "summaryMessageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "summarizedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "user_memory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "conversationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_memory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_memory_userId_idx" ON "user_memory"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_memory_userId_key_key" ON "user_memory"("userId", "key");

-- AddForeignKey
ALTER TABLE "user_memory" ADD CONSTRAINT "user_memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
