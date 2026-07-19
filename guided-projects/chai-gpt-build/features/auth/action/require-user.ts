"use server"

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

/**
 * Ensures the request is authenticated and the user has completed onboarding.
 *
 * @returns The Prisma `User` linked to the current Clerk session.
 * @throws {Error} When the user record does not exist in the database.
 */
export async function requireUser() {
    const { userId } = await auth.protect();
  
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
  
    if (!user) {
      throw new Error("User not found. Complete onboarding first.");
    }
  
    return user;
  }
  