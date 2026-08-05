/**
 * Session type inferred from the Better Auth configuration.
 *
 * Use this type when typing Express request handlers that access `req.session`.
 */

import type { auth } from "../lib/auth.js";

/**
 * Authenticated session shape including `user` and `session` metadata.
 *
 */
export type Session = typeof auth.$Infer.Session;
