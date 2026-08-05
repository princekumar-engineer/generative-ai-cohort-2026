/**
 * Better Auth server configuration.
 *
 * Handles Google OAuth and session persistence via Prisma/PostgreSQL.
 * The client authenticates against routes mounted from this `auth` instance.
 *
 * Required env vars: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
 * Optional: `BETTER_AUTH_URL`, `CLIENT_URL`
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db.js";

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

/**
 * Configured Better Auth instance shared by Express route handlers.
 *
 */
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? clientUrl,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [clientUrl],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
});
