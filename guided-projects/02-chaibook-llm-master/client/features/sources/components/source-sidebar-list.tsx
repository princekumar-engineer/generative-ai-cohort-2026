"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useSources } from "../hooks/use-sources";
import { sourceRoutes } from "../lib/routes";
import { SourceTypeIcon } from "./source-type-icon";

type SourceSidebarListProps = {
    workspaceId: string;
    onAddSource: () => void;
};

export function SourceSidebarList({
    workspaceId,
    onAddSource,
}: SourceSidebarListProps) {
    const { data: sources, isLoading } = useSources(workspaceId);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Sources</SidebarGroupLabel>
            <SidebarGroupAction
                title="Add source"
                onClick={onAddSource}
            >
                <PlusIcon />
                <span className="sr-only">Add source</span>
            </SidebarGroupAction>
            <SidebarGroupContent>
                {isLoading ? (
                    <div className="flex flex-col gap-2 px-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <SidebarMenuSkeleton key={index} showIcon />
                        ))}
                    </div>
                ) : sources && sources.length > 0 ? (
                    <SidebarMenu>
                        {sources.slice(0, 8).map((source) => (
                            <SidebarMenuItem key={source.id}>
                                <SidebarMenuButton
                                    render={
                                        <Link
                                            href={sourceRoutes.detail(
                                                workspaceId,
                                                source.id,
                                            )}
                                        />
                                    }
                                >
                                    <SourceTypeIcon type={source.type} />
                                    <span className="truncate">
                                        {source.title}
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        {sources.length > 8 ? (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    render={
                                        <Link
                                            href={sourceRoutes.list(
                                                workspaceId,
                                            )}
                                        />
                                    }
                                >
                                    View all ({sources.length})
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ) : null}
                    </SidebarMenu>
                ) : (
                    <div className="space-y-2 px-2 py-1">
                        <p className="text-xs text-muted-foreground">
                            No sources yet.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={onAddSource}
                        >
                            <PlusIcon />
                            Add source
                        </Button>
                    </div>
                )}
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
