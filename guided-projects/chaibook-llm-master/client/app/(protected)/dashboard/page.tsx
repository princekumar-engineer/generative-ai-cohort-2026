import { requireAuth } from "@/features/auth";
import { DashboardHome } from "@/features/workspaces/components/dashboard-home";

export default async function DashboardPage() {
    const session = await requireAuth();

    return <DashboardHome userName={session.user.name} />;
}
