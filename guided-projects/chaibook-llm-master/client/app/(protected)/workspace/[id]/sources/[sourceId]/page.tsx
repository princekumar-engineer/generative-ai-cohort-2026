import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { SourceDetail } from "@/features/sources";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type SourceDetailPageProps = {
    params: Promise<{ id: string; sourceId: string }>;
};

export default async function SourceDetailPage({
    params,
}: SourceDetailPageProps) {
    await requireAuth();
    const { id, sourceId } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return (
        <WorkspaceShell workspace={workspace}>
            <SourceDetail workspaceId={workspace.id} sourceId={sourceId} />
        </WorkspaceShell>
    );
}
