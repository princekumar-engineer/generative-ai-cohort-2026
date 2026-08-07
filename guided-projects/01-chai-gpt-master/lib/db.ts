import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";


// Reuse a single PrismaClient across hot reloads in development by stashing it
// on the global object. Without this, Next.js would create a new client (and
// connection pool) on every reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Build a new PrismaClient backed by the `pg` adapter.
 *
 * @returns A configured PrismaClient instance.
 * @throws If the `DATABASE_URL` environment variable is not set.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

/**
 * Shared Prisma database client used throughout the app.
 *
 * Reuses the cached instance when available, otherwise creates a new one.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();


if(process.env.NODE_ENV !== "production"){
    globalForPrisma.prisma = prisma;
}