import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Routes that may be accessed without authentication: the sign-in flow and the
 * Inngest webhook endpoint.
 */
const isPublicRoute = createRouteMatcher(['/sign-in(.*)'])

/**
 * Clerk auth middleware.
 *
 * Protects every request except those matching {@link isPublicRoute}, redirecting
 * unauthenticated users to sign in.
 */
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}