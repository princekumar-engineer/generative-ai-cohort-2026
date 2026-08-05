import { requireAuth } from "@/features/auth";
import { MemorySettings } from "@/features/memory";

export default async function MemorySettingsPage() {
    await requireAuth();

    return <MemorySettings />;
}
