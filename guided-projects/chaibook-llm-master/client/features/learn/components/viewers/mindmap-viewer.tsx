"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import Link from "next/link";
import {
    Background,
    Controls,
    Handle,
    MiniMap,
    Position,
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
    type Edge,
    type Node,
    type NodeProps,
} from "@xyflow/react";
import {
    ChevronDownIcon,
    ChevronRightIcon,
    Maximize2Icon,
    MessageSquareIcon,
    Minimize2Icon,
    MinusIcon,
    PlusIcon,
    ScanIcon,
} from "lucide-react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import type { MindMapEdge, MindMapNode } from "../../lib/types";

const NODE_WIDTH = 200;
const ROOT_WIDTH = 230;
const NODE_HEIGHT = 46;
const ROW_GAP = 72;
const COL_GAP = 270;

type TreeNode = {
    id: string;
    label: string;
    children: TreeNode[];
};

type Placement = {
    x: number;
    y: number;
    direction: 1 | -1;
    depth: number;
};

type MindMapActions = {
    toggleCollapse: (nodeId: string) => void;
    selectNode: (nodeId: string) => void;
};

const MindMapActionsContext = createContext<MindMapActions | null>(null);

function buildTree(nodes: MindMapNode[], edges: MindMapEdge[]) {
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const children = new Map<string, string[]>();
    const incoming = new Map<string, number>();

    for (const node of nodes) {
        children.set(node.id, []);
        incoming.set(node.id, 0);
    }

    for (const edge of edges) {
        if (!children.has(edge.source) || !incoming.has(edge.target)) {
            continue;
        }

        children.get(edge.source)?.push(edge.target);
        incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    }

    const claimed = new Set<string>();

    function toTreeNode(id: string): TreeNode | null {
        const source = nodeMap.get(id);
        if (!source || claimed.has(id)) {
            return null;
        }

        claimed.add(id);

        const childNodes = (children.get(id) ?? [])
            .map((childId) => toTreeNode(childId))
            .filter((child): child is TreeNode => child !== null);

        return {
            id: source.id,
            label: source.label,
            children: childNodes,
        };
    }

    const rootId =
        nodes.find((node) => (incoming.get(node.id) ?? 0) === 0)?.id ??
        nodes[0]?.id;

    if (!rootId) {
        return null;
    }

    const root = toTreeNode(rootId);

    if (!root) {
        return null;
    }

    for (const node of nodes) {
        const orphan = toTreeNode(node.id);
        if (orphan) {
            root.children.push(orphan);
        }
    }

    return root;
}

function collectExpandableIds(node: TreeNode, ids: string[] = []) {
    if (node.children.length > 0) {
        ids.push(node.id);
        for (const child of node.children) {
            collectExpandableIds(child, ids);
        }
    }

    return ids;
}

function countLeaves(node: TreeNode, collapsed: Set<string>): number {
    if (collapsed.has(node.id) || node.children.length === 0) {
        return 1;
    }

    return node.children.reduce(
        (total, child) => total + countLeaves(child, collapsed),
        0,
    );
}

function layoutBranch(
    node: TreeNode,
    depth: number,
    top: number,
    direction: 1 | -1,
    placements: Map<string, Placement>,
    collapsed: Set<string>,
) {
    const height = countLeaves(node, collapsed) * ROW_GAP;
    const centerX = direction * depth * COL_GAP;
    const centerY = top + height / 2;

    placements.set(node.id, {
        x: centerX - NODE_WIDTH / 2,
        y: centerY - NODE_HEIGHT / 2,
        direction,
        depth,
    });

    if (!collapsed.has(node.id)) {
        let cursor = top;

        for (const child of node.children) {
            cursor += layoutBranch(
                child,
                depth + 1,
                cursor,
                direction,
                placements,
                collapsed,
            );
        }
    }

    return height;
}

function computeTreeLayout(root: TreeNode, collapsed: Set<string>) {
    const placements = new Map<string, Placement>();

    placements.set(root.id, {
        x: -ROOT_WIDTH / 2,
        y: -NODE_HEIGHT / 2,
        direction: 1,
        depth: 0,
    });

    if (collapsed.has(root.id) || root.children.length === 0) {
        return placements;
    }

    const rightBranches: TreeNode[] = [];
    const leftBranches: TreeNode[] = [];
    let rightLeaves = 0;
    let leftLeaves = 0;

    for (const child of root.children) {
        const leaves = countLeaves(child, collapsed);

        if (rightLeaves <= leftLeaves) {
            rightBranches.push(child);
            rightLeaves += leaves;
        } else {
            leftBranches.push(child);
            leftLeaves += leaves;
        }
    }

    let rightCursor = (-rightLeaves * ROW_GAP) / 2;
    for (const branch of rightBranches) {
        rightCursor += layoutBranch(
            branch,
            1,
            rightCursor,
            1,
            placements,
            collapsed,
        );
    }

    let leftCursor = (-leftLeaves * ROW_GAP) / 2;
    for (const branch of leftBranches) {
        leftCursor += layoutBranch(
            branch,
            1,
            leftCursor,
            -1,
            placements,
            collapsed,
        );
    }

    return placements;
}

function MindMapFlowNode({ id, data, selected }: NodeProps) {
    const actions = useContext(MindMapActionsContext);
    const label = typeof data.label === "string" ? data.label : "Untitled";
    const hasChildren = Boolean(data.hasChildren);
    const collapsed = Boolean(data.collapsed);
    const isRoot = Boolean(data.isRoot);
    const hasLeftBranch = Boolean(data.hasLeftBranch);
    const hasRightBranch = Boolean(data.hasRightBranch);
    const direction = data.direction === -1 ? -1 : 1;

    const handleClass = "size-1.5 border-border! bg-muted-foreground!";

    return (
        <div
            style={{ width: isRoot ? ROOT_WIDTH : NODE_WIDTH }}
            className={`rounded-2xl border px-3 py-2 shadow-sm transition-colors ${
                selected
                    ? "border-primary bg-primary/15 ring-2 ring-primary/40"
                    : isRoot
                      ? "border-primary/60 bg-card text-card-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/40"
            }`}
            onClick={() => actions?.selectNode(id)}
        >
            {!isRoot ? (
                <Handle
                    type="target"
                    id={direction === 1 ? "tl" : "tr"}
                    position={direction === 1 ? Position.Left : Position.Right}
                    className={handleClass}
                />
            ) : null}

            <div
                className={`flex items-start gap-1.5 ${
                    direction === -1 && !isRoot ? "flex-row-reverse" : ""
                }`}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        className="mt-0.5 shrink-0 rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={(event) => {
                            event.stopPropagation();
                            actions?.toggleCollapse(id);
                        }}
                        aria-label={
                            collapsed ? "Expand branch" : "Collapse branch"
                        }
                    >
                        {collapsed ? (
                            <ChevronRightIcon className="size-4" />
                        ) : (
                            <ChevronDownIcon className="size-4" />
                        )}
                    </button>
                ) : null}
                <p
                    className={`flex-1 text-sm leading-snug ${
                        isRoot
                            ? "text-center font-medium"
                            : direction === -1
                              ? "text-right"
                              : "text-left"
                    }`}
                >
                    {label}
                </p>
            </div>

            {isRoot ? (
                <>
                    {hasLeftBranch ? (
                        <Handle
                            type="source"
                            id="sl"
                            position={Position.Left}
                            className={handleClass}
                        />
                    ) : null}
                    {hasRightBranch ? (
                        <Handle
                            type="source"
                            id="sr"
                            position={Position.Right}
                            className={handleClass}
                        />
                    ) : null}
                </>
            ) : hasChildren ? (
                <Handle
                    type="source"
                    id={direction === 1 ? "sr" : "sl"}
                    position={direction === 1 ? Position.Right : Position.Left}
                    className={handleClass}
                />
            ) : null}
        </div>
    );
}

const nodeTypes = {
    mindmap: MindMapFlowNode,
};

type MindMapCanvasProps = {
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    workspaceId?: string;
};

function MindMapCanvas({ nodes, edges, workspaceId }: MindMapCanvasProps) {
    const tree = useMemo(() => buildTree(nodes, edges), [nodes, edges]);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { fitView } = useReactFlow();

    const expandableIds = useMemo(
        () => (tree ? collectExpandableIds(tree) : []),
        [tree],
    );

    const placements = useMemo(
        () =>
            tree
                ? computeTreeLayout(tree, collapsed)
                : new Map<string, Placement>(),
        [tree, collapsed],
    );

    const parentsWithChildren = useMemo(
        () => new Set(edges.map((edge) => edge.source)),
        [edges],
    );

    const flowNodes: Node[] = useMemo(() => {
        if (!tree) {
            return [];
        }

        const rootChildDirections = tree.children
            .map((child) => placements.get(child.id)?.direction)
            .filter((direction): direction is 1 | -1 => direction !== undefined);

        return nodes
            .filter((node) => placements.has(node.id))
            .map((node) => {
                const placement = placements.get(node.id)!;
                const isRoot = node.id === tree.id;

                return {
                    id: node.id,
                    type: "mindmap",
                    draggable: false,
                    data: {
                        label: node.label,
                        hasChildren: parentsWithChildren.has(node.id),
                        collapsed: collapsed.has(node.id),
                        isRoot,
                        direction: placement.direction,
                        hasLeftBranch: rootChildDirections.includes(-1),
                        hasRightBranch: rootChildDirections.includes(1),
                    },
                    position: { x: placement.x, y: placement.y },
                    selected: selectedId === node.id,
                };
            });
    }, [
        nodes,
        tree,
        placements,
        parentsWithChildren,
        collapsed,
        selectedId,
    ]);

    const flowEdges: Edge[] = useMemo(
        () =>
            edges
                .filter(
                    (edge) =>
                        placements.has(edge.source) &&
                        placements.has(edge.target) &&
                        !collapsed.has(edge.source),
                )
                .map((edge) => {
                    const direction =
                        placements.get(edge.target)?.direction ?? 1;
                    const isSelected =
                        selectedId === edge.source || selectedId === edge.target;

                    return {
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: direction === 1 ? "sr" : "sl",
                        targetHandle: direction === 1 ? "tl" : "tr",
                        type: "bezier",
                        animated: isSelected,
                        style: {
                            stroke: isSelected
                                ? "var(--primary)"
                                : "var(--border)",
                            strokeWidth: isSelected ? 2 : 1.5,
                        },
                    };
                }),
        [edges, placements, collapsed, selectedId],
    );

    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === selectedId) ?? null,
        [nodes, selectedId],
    );

    const toggleCollapse = useCallback((nodeId: string) => {
        setCollapsed((current) => {
            const next = new Set(current);
            if (next.has(nodeId)) {
                next.delete(nodeId);
            } else {
                next.add(nodeId);
            }
            return next;
        });
    }, []);

    const selectNode = useCallback((nodeId: string) => {
        setSelectedId(nodeId);
    }, []);

    const expandAll = useCallback(() => {
        setCollapsed(new Set());
    }, []);

    const collapseAll = useCallback(() => {
        setCollapsed(new Set(expandableIds));
    }, [expandableIds]);

    const fitMap = useCallback(() => {
        void fitView({ padding: 0.2, duration: 300 });
    }, [fitView]);

    useEffect(() => {
        const timer = window.setTimeout(fitMap, 60);
        return () => window.clearTimeout(timer);
    }, [collapsed, fitMap, flowNodes.length]);

    const actions = useMemo(
        () => ({ toggleCollapse, selectNode }),
        [toggleCollapse, selectNode],
    );

    if (!tree) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Mind map data is empty.
            </div>
        );
    }

    const chatHref =
        selectedNode && workspaceId
            ? `${workspaceRoutes.detail(workspaceId)}?ask=${encodeURIComponent(
                  `Tell me more about "${selectedNode.label}" based on my sources.`,
              )}`
            : null;

    return (
        <MindMapActionsContext.Provider value={actions}>
            <div className="flex h-full min-h-0 flex-col">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">
                        Use the arrows to expand or collapse branches. Select a
                        node to explore it in chat.
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Button size="sm" variant="outline" onClick={expandAll}>
                            <PlusIcon />
                            Expand all
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={collapseAll}
                        >
                            <MinusIcon />
                            Collapse all
                        </Button>
                        <Button size="sm" variant="outline" onClick={fitMap}>
                            <ScanIcon />
                            Fit view
                        </Button>
                    </div>
                </div>

                <div className="relative min-h-0 flex-1">
                    <ReactFlow
                        nodes={flowNodes}
                        edges={flowEdges}
                        nodeTypes={nodeTypes}
                        colorMode="dark"
                        fitView
                        fitViewOptions={{ padding: 0.2 }}
                        minZoom={0.15}
                        maxZoom={1.8}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable
                        panOnScroll
                        zoomOnScroll
                        proOptions={{ hideAttribution: true }}
                    >
                        <MiniMap
                            pannable
                            zoomable
                            nodeColor="var(--muted-foreground)"
                            maskColor="color-mix(in oklab, var(--background) 75%, transparent)"
                            className="rounded-xl! border! border-border! bg-card/90!"
                        />
                        <Controls className="rounded-xl! border! border-border! bg-card! shadow-sm! [&>button]:border-border! [&>button]:bg-card! [&>button]:text-foreground! [&>button:hover]:bg-muted!" />
                        <Background gap={20} color="var(--border)" />
                    </ReactFlow>
                </div>

                {selectedNode ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-card/40 px-4 py-3">
                        <div className="min-w-0">
                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                Selected topic
                            </p>
                            <p className="truncate font-medium">
                                {selectedNode.label}
                            </p>
                        </div>
                        {chatHref ? (
                            <Button
                                nativeButton={false}
                                size="sm"
                                render={<Link href={chatHref} />}
                            >
                                <MessageSquareIcon />
                                Ask in chat
                            </Button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </MindMapActionsContext.Provider>
    );
}

type MindMapViewerProps = {
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    workspaceId?: string;
    className?: string;
};

export function MindMapViewer({
    nodes,
    edges,
    workspaceId,
    className,
}: MindMapViewerProps) {
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        if (!fullscreen) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setFullscreen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fullscreen]);

    const containerClass = fullscreen
        ? "fixed inset-0 z-50 flex flex-col bg-background"
        : `flex min-h-[min(74vh,780px)] flex-col overflow-hidden rounded-3xl border bg-muted/20 ${className ?? ""}`;

    return (
        <div className={containerClass}>
            <div className="flex items-center justify-end gap-2 border-b border-border/60 px-3 py-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setFullscreen((value) => !value)}
                >
                    {fullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
                    {fullscreen ? "Exit full screen" : "Full screen"}
                </Button>
            </div>

            <div className="min-h-0 flex-1">
                <ReactFlowProvider>
                    <MindMapCanvas
                        nodes={nodes}
                        edges={edges}
                        workspaceId={workspaceId}
                    />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
