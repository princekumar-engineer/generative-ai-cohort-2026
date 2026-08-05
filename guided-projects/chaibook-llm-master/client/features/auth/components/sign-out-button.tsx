"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { signOut } from "../lib/auth-client";
import { authRoutes } from "../lib/auth-routes";

export function SignOutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignOut() {
        setIsLoading(true);

        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push(authRoutes.login);
                    router.refresh();
                },
            },
        });

        setIsLoading(false);
    }

    return (
        <Button
            variant="outline"
            onClick={() => void handleSignOut()}
            disabled={isLoading}
        >
            {isLoading ? <Spinner /> : null}
            Sign out
        </Button>
    );
}
