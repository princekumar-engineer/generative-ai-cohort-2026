"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import * as React from "react";

/**
 * Provides a TanStack Query client to the React tree (30s default stale time).
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000, // 30 seconds
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}

        </QueryClientProvider>
    );
}
