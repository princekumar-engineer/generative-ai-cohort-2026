import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { LearnHub } from "@/features/learn";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type LearnPageProps = {
    params: Promise<{ id: string }>;
};

export default async function LearnPage({ params }: LearnPageProps) {
    await requireAuth();
    const { id } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return (
        <WorkspaceShell workspace={workspace}>
            <LearnHub workspaceId={workspace.id} />
        </WorkspaceShell>
    );
}
