export { LoginForm } from "./components/login-form";
export { SignOutButton } from "./components/sign-out-button";

export { authClient, signIn, signOut } from "./lib/auth-client";
export { useSession } from "./hooks/use-session";

export {
    authRoutes,
    protectedRoutes,
    unauthenticatedRoutes,
    isProtectedRoute,
    isUnauthenticatedRoute,
} from "./lib/auth-routes";

export { getSession, type Session } from "./lib/auth-server";
export { requireAuth } from "./lib/require-auth";
export { unauth } from "./lib/unauth";
