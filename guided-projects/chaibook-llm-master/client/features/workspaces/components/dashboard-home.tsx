"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    BookOpenIcon,
    BrainIcon,
    MessageSquareIcon,
    SearchIcon,
    SparklesIcon,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { memoryRoutes } from "@/features/memory";
import { ApiError } from "@/shared/lib/api";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import {
    useCreateWorkspace,
    useDeleteWorkspace,
    useUpdateWorkspace,
    useWorkspaces,
} from "../hooks/use-workspaces";
import { workspaceRoutes } from "../lib/routes";
import type { Workspace } from "../lib/types";
import { CreateWorkspaceCard } from "./create-workspace-card";
import { DeleteWorkspaceDialog } from "./delete-workspace-dialog";
import { WorkspaceCard } from "./workspace-card";
import { WorkspaceFormDialog } from "./workspace-form-dialog";

type DashboardHomeProps = {
    userName?: string | null;
};

const FEATURES = [
    {
        icon: BookOpenIcon,
        title: "Upload sources",
        description: "PDFs, websites, YouTube, and notes in one place",
    },
    {
        icon: MessageSquareIcon,
        title: "Chat with context",
        description: "Ask questions grounded in your materials",
    },
    {
        icon: SparklesIcon,
        title: "Learn faster",
        description: "Flashcards, quizzes, mind maps, and summaries",
    },
] as const;

export function DashboardHome({ userName }: DashboardHomeProps) {
    const router = useRouter();
    const { data: workspaces, isLoading, error } = useWorkspaces();
    const createWorkspace = useCreateWorkspace();
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 200);

    const [createOpen, setCreateOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(
        null,
    );
    const [deletingWorkspace, setDeletingWorkspace] =
        useState<Workspace | null>(null);

    const updateWorkspace = useUpdateWorkspace(editingWorkspace?.id ?? "");
    const deleteWorkspace = useDeleteWorkspace();

    const filteredWorkspaces = useMemo(() => {
        if (!workspaces) {
            return [];
        }

        const query = debouncedSearch.trim().toLowerCase();
        if (!query) {
            return workspaces;
        }

        return workspaces.filter((workspace) => {
            const haystack = [
                workspace.title,
                workspace.description ?? "",
            ]
                .join(" ")
                .toLowerCase();

            return haystack.includes(query);
        });
    }, [workspaces, debouncedSearch]);

    const greeting = userName?.split(" ")[0] ?? "there";

    return (
        <div className="min-h-svh bg-muted/30">
            <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
                    <Link
                        href={workspaceRoutes.list}
                        className="flex items-center gap-2.5 font-heading text-lg font-semibold tracking-tight"
                    >
                        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-base">
                            📚
                        </span>
                        Chaibook
                    </Link>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Button
                            nativeButton={false}
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex"
                            render={<Link href={memoryRoutes.settings} />}
                        >
                            <BrainIcon />
                            Memory
                        </Button>
                        <ModeToggle />
                        <SignOutButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
                <section className="mb-10 space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">
                            Welcome back, {greeting}
                        </p>
                        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                            Your notebooks
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                            Organize sources, chat with your materials, and
                            generate learning tools — all in one workspace.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border bg-card/70 p-4 shadow-sm"
                            >
                                <feature.icon className="mb-2 size-4 text-primary" />
                                <p className="text-sm font-medium">
                                    {feature.title}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-heading text-xl font-semibold">
                                Recent notebooks
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {workspaces?.length
                                    ? `${workspaces.length} notebook${workspaces.length === 1 ? "" : "s"}`
                                    : "Start with your first notebook"}
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search notebooks..."
                                className="rounded-full bg-background pl-9"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="min-h-[196px] rounded-3xl"
                                />
                            ))}
                        </div>
                    ) : error ? (
                        <Empty className="rounded-3xl border bg-card">
                            <EmptyHeader>
                                <EmptyTitle>
                                    Could not load notebooks
                                </EmptyTitle>
                                <EmptyDescription>
                                    {error instanceof ApiError
                                        ? error.message
                                        : "Please try again in a moment."}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <CreateWorkspaceCard
                                onClick={() => setCreateOpen(true)}
                            />

                            {filteredWorkspaces.map((workspace) => (
                                <WorkspaceCard
                                    key={workspace.id}
                                    workspace={workspace}
                                    onEdit={setEditingWorkspace}
                                    onDelete={setDeletingWorkspace}
                                />
                            ))}
                        </div>
                    )}

                    {!isLoading &&
                    !error &&
                    workspaces &&
                    workspaces.length > 0 &&
                    filteredWorkspaces.length === 0 ? (
                        <Empty className="rounded-3xl border bg-card">
                            <EmptyHeader>
                                <EmptyTitle>No notebooks found</EmptyTitle>
                                <EmptyDescription>
                                    Try a different search term or create a new
                                    notebook.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => setSearch("")}>
                                    Clear search
                                </Button>
                            </EmptyContent>
                        </Empty>
                    ) : null}
                </section>
            </main>

            <WorkspaceFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                isPending={createWorkspace.isPending}
                onSubmit={async (values) => {
                    const workspace = await createWorkspace.mutateAsync(values);
                    router.push(workspaceRoutes.detail(workspace.id));
                }}
            />

            <WorkspaceFormDialog
                open={Boolean(editingWorkspace)}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingWorkspace(null);
                    }
                }}
                workspace={editingWorkspace}
                isPending={updateWorkspace.isPending}
                onSubmit={async (values) => {
                    await updateWorkspace.mutateAsync(values);
                    setEditingWorkspace(null);
                }}
            />

            <DeleteWorkspaceDialog
                workspace={deletingWorkspace}
                open={Boolean(deletingWorkspace)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingWorkspace(null);
                    }
                }}
                isPending={deleteWorkspace.isPending}
                onConfirm={async () => {
                    if (!deletingWorkspace) {
                        return;
                    }

                    await deleteWorkspace.mutateAsync(deletingWorkspace.id);
                    setDeletingWorkspace(null);
                }}
            />
        </div>
    );
}
