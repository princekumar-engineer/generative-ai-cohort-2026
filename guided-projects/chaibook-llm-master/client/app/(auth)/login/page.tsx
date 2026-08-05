import { Suspense } from "react";
import { LoginForm, unauth } from "@/features/auth";

export default async function LoginPage() {
    await unauth();

    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}
