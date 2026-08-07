"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@/lib/generated/prisma/client";

/**
 * Sync the signed-in Clerk user into the database on each protected visit.
 * Creates the user on first sign-in, updates profile fields on later visits.
 */
export async function onBoard(): Promise<User> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      id: clerkUser.id,
      clerkId: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });
}
