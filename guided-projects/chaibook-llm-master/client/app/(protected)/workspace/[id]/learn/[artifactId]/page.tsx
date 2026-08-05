import { notFound } from "next/navigation";
import { requireAuth } from "@/features/auth";
import { ArtifactDetail } from "@/features/learn";
import { getWorkspaceOrNull } from "@/features/workspaces/lib/workspace-server";
import { WorkspaceShell } from "@/features/workspaces";

type ArtifactPageProps = {
    params: Promise<{ id: string; artifactId: string }>;
};

export default async function ArtifactPage({ params }: ArtifactPageProps) {
    await requireAuth();
    const { id, artifactId } = await params;
    const workspace = await getWorkspaceOrNull(id);

    if (!workspace) {
        notFound();
    }

    return (
        <WorkspaceShell workspace={workspace}>
            <ArtifactDetail
                workspaceId={workspace.id}
                artifactId={artifactId}
            />
        </WorkspaceShell>
    );
}
