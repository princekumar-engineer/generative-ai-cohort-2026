"use client";

import { useMemo, useState } from "react";
import {
    BookOpenIcon,
    LayoutGridIcon,
    ListIcon,
    MoreHorizontalIcon,
    PlusIcon,
    RefreshCwIcon,
    SearchIcon,
    Trash2Icon,
    XIcon,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ApiError } from "@/shared/lib/api";
import {
    useBulkDeleteSources,
    useDeleteSource,
    useReprocessSources,
    useSources,
} from "../hooks/use-sources";
import {
    SOURCE_STATUS_LABELS,
    SOURCE_STATUSES,
    SOURCE_TYPE_LABELS,
    SOURCE_TYPES,
} from "../lib/constants";
import type { Source, SourceFilters, SourceStatus, SourceType } from "../lib/types";
import { AddSourceDialog } from "./add-source-dialog";
import { SourceCard } from "./source-card";

type SourceLibraryProps = {
    workspaceId: string;
};

export function SourceLibrary({ workspaceId }: SourceLibraryProps) {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [addOpen, setAddOpen] = useState(false);
    const [deletingSource, setDeletingSource] = useState<Source | null>(null);
    const [filters, setFilters] = useState<SourceFilters>({});
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectionMode, setSelectionMode] = useState(false);

    const { data: sources, isLoading, error } = useSources(workspaceId, filters);
    const deleteSource = useDeleteSource(workspaceId);
    const bulkDelete = useBulkDeleteSources(workspaceId);
    const reprocessFailed = useReprocessSources(workspaceId);

    const failedCount =
        sources?.filter((source) => source.status === "FAILED").length ?? 0;

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.q?.trim()) count += 1;
        if (filters.type) count += 1;
        if (filters.status) count += 1;
        return count;
    }, [filters]);

    const hasActiveFilters = activeFilterCount > 0;

    function clearFilters() {
        setFilters({});
    }

    function exitSelectionMode() {
        setSelectionMode(false);
        setSelectedIds([]);
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 className="font-heading text-2xl font-semibold tracking-tight">
                        Source library
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {sources
                            ? `${sources.length} source${sources.length === 1 ? "" : "s"} in this workspace`
                            : "All knowledge sources in this workspace"}
                    </p>
                </div>
                <Button onClick={() => setAddOpen(true)} className="shrink-0">
                    <PlusIcon />
                    Add source
                </Button>
            </div>

            <div className="space-y-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="relative min-w-0 flex-1">
                        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="rounded-full bg-background pl-9"
                            placeholder="Search sources..."
                            value={filters.q ?? ""}
                            onChange={(event) =>
                                setFilters((current) => ({
                                    ...current,
                                    q: event.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Select
                            value={filters.type ?? "all"}
                            onValueChange={(value) =>
                                setFilters((current) => ({
                                    ...current,
                                    type:
                                        value === "all"
                                            ? undefined
                                            : (value as SourceType),
                                }))
                            }
                        >
                            <SelectTrigger className="w-[130px] rounded-full">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                {SOURCE_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {SOURCE_TYPE_LABELS[type]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.status ?? "all"}
                            onValueChange={(value) =>
                                setFilters((current) => ({
                                    ...current,
                                    status:
                                        value === "all"
                                            ? undefined
                                            : (value as SourceStatus),
                                }))
                            }
                        >
                            <SelectTrigger className="w-[130px] rounded-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                {SOURCE_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {SOURCE_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center rounded-full border bg-background p-0.5">
                            <Button
                                variant={view === "grid" ? "secondary" : "ghost"}
                                size="icon-sm"
                                className="rounded-full"
                                onClick={() => setView("grid")}
                            >
                                <LayoutGridIcon />
                                <span className="sr-only">Grid view</span>
                            </Button>
                            <Button
                                variant={view === "list" ? "secondary" : "ghost"}
                                size="icon-sm"
                                className="rounded-full"
                                onClick={() => setView("list")}
                            >
                                <ListIcon />
                                <span className="sr-only">List view</span>
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        className="rounded-full"
                                    />
                                }
                            >
                                <MoreHorizontalIcon />
                                <span className="sr-only">More actions</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (selectionMode) {
                                            exitSelectionMode();
                                            return;
                                        }
                                        setSelectionMode(true);
                                    }}
                                >
                                    {selectionMode
                                        ? "Cancel selection"
                                        : "Select sources"}
                                </DropdownMenuItem>
                                {failedCount > 0 ? (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            disabled={reprocessFailed.isPending}
                                            onClick={() =>
                                                void reprocessFailed.mutateAsync(
                                                    undefined,
                                                )
                                            }
                                        >
                                            <RefreshCwIcon />
                                            Reprocess failed ({failedCount})
                                        </DropdownMenuItem>
                                    </>
                                ) : null}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {hasActiveFilters ? (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                            {activeFilterCount} filter
                            {activeFilterCount === 1 ? "" : "s"} applied
                        </span>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-muted-foreground"
                            onClick={clearFilters}
                        >
                            <XIcon />
                            Clear
                        </Button>
                    </div>
                ) : null}

                {selectionMode ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-muted/30 px-4 py-3">
                        <p className="text-sm text-muted-foreground">
                            {selectedIds.length > 0
                                ? `${selectedIds.length} selected`
                                : "Select sources to bulk delete"}
                        </p>
                        <div className="flex items-center gap-2">
                            {selectedIds.length > 0 ? (
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={bulkDelete.isPending}
                                    onClick={() => {
                                        void bulkDelete
                                            .mutateAsync(selectedIds)
                                            .then(exitSelectionMode);
                                    }}
                                >
                                    <Trash2Icon />
                                    Delete selected
                                </Button>
                            ) : null}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={exitSelectionMode}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            {isLoading ? (
                <div
                    className={cn(
                        "grid gap-4",
                        view === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "",
                    )}
                >
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className={cn(
                                "rounded-3xl",
                                view === "grid" ? "h-40" : "h-24",
                            )}
                        />
                    ))}
                </div>
            ) : error ? (
                <Empty className="rounded-3xl border bg-card/50">
                    <EmptyHeader>
                        <EmptyTitle>Could not load sources</EmptyTitle>
                        <EmptyDescription>
                            {error instanceof ApiError
                                ? error.message
                                : "Please try again."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : sources && sources.length > 0 ? (
                <div
                    className={cn(
                        "grid gap-4",
                        view === "grid"
                            ? "sm:grid-cols-2 xl:grid-cols-3"
                            : "grid-cols-1",
                    )}
                >
                    {sources.map((source) => (
                        <div key={source.id} className="relative">
                            {selectionMode ? (
                                <div className="absolute top-4 left-4 z-10">
                                    <Checkbox
                                        checked={selectedIds.includes(source.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedIds((current) =>
                                                checked
                                                    ? [...current, source.id]
                                                    : current.filter(
                                                          (id) =>
                                                              id !== source.id,
                                                      ),
                                            );
                                        }}
                                    />
                                </div>
                            ) : null}
                            <SourceCard
                                source={source}
                                onDelete={setDeletingSource}
                                onReprocess={
                                    source.status === "FAILED"
                                        ? (target) =>
                                              void reprocessFailed.mutateAsync([
                                                  target.id,
                                              ])
                                        : undefined
                                }
                                className={selectionMode ? "pl-10" : undefined}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Empty className="rounded-3xl border border-dashed bg-muted/20 py-16">
                    <EmptyHeader>
                        <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted">
                            <BookOpenIcon className="size-5 text-muted-foreground" />
                        </div>
                        <EmptyTitle>No sources found</EmptyTitle>
                        <EmptyDescription>
                            {hasActiveFilters
                                ? "Try adjusting your search or filters."
                                : "Add your first source to start building this notebook."}
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent className="flex flex-wrap justify-center gap-2">
                        {hasActiveFilters ? (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear filters
                            </Button>
                        ) : null}
                        <Button onClick={() => setAddOpen(true)}>
                            <PlusIcon />
                            Add source
                        </Button>
                    </EmptyContent>
                </Empty>
            )}

            <AddSourceDialog
                workspaceId={workspaceId}
                open={addOpen}
                onOpenChange={setAddOpen}
            />

            <AlertDialog
                open={Boolean(deletingSource)}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingSource(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete source?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-medium text-foreground">
                                {deletingSource?.title}
                            </span>
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteSource.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteSource.isPending}
                            onClick={(event) => {
                                event.preventDefault();
                                if (!deletingSource) {
                                    return;
                                }
                                void deleteSource
                                    .mutateAsync(deletingSource.id)
                                    .then(() => setDeletingSource(null));
                            }}
                        >
                            {deleteSource.isPending ? <Spinner /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
