import { NextRequest, NextResponse } from "next/server";
import {
    authRoutes,
    isProtectedRoute,
    isUnauthenticatedRoute,
} from "@/features/auth";

async function fetchSession(request: NextRequest) {
    const response = await fetch(
        new URL("/api/auth/get-session", request.nextUrl.origin),
        {
            headers: {
                cookie: request.headers.get("cookie") ?? "",
            },
            cache: "no-store",
        },
    );

    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    return data?.user ? data : null;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await fetchSession(request);

    if (isProtectedRoute(pathname) && !session) {
        const loginUrl = new URL(authRoutes.login, request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isUnauthenticatedRoute(pathname) && session) {
        return NextResponse.redirect(new URL(authRoutes.dashboard, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/workspace/:path*", "/login"],
};
