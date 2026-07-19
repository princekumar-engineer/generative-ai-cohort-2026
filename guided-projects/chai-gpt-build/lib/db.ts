import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";



const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Creates a Prisma client backed by the PostgreSQL adapter.
 *
 * @throws {Error} When `DATABASE_URL` is not set.
 */
function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}


/** Singleton Prisma client; reused in development to avoid hot-reload connection leaks. */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();


if(process.env.NODE_ENV !== "production"){
    globalForPrisma.prisma = prisma;
}