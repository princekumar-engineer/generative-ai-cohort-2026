"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreamdownContent } from "@/shared/components/streamdown-content";

export function TakeawaysViewer({ items }: { items: string[] }) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    async function copyItem(item: string, index: number) {
        await navigator.clipboard.writeText(item);
        setCopiedIndex(index);
        window.setTimeout(() => setCopiedIndex(null), 1500);
    }

    async function copyAll() {
        await navigator.clipboard.writeText(
            items.map((item) => `• ${item}`).join("\n"),
        );
        setCopiedAll(true);
        window.setTimeout(() => setCopiedAll(false), 1500);
    }

    if (items.length === 0) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                No takeaways were generated.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground tabular-nums">
                    {items.length} key takeaways
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void copyAll()}
                >
                    {copiedAll ? <CheckIcon /> : <CopyIcon />}
                    {copiedAll ? "Copied" : "Copy all"}
                </Button>
            </div>

            <ul className="space-y-2.5">
                {items.map((item, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: Math.min(index * 0.04, 0.4),
                            duration: 0.25,
                        }}
                        className="group flex items-start gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors hover:border-primary/40"
                    >
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary tabular-nums">
                            {index + 1}
                        </span>

                        <StreamdownContent
                            content={item}
                            className="prose prose-sm dark:prose-invert min-w-0 flex-1 max-w-none [&_p]:my-0 [&_p+p]:mt-2"
                        />

                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                            onClick={() => void copyItem(item, index)}
                            aria-label="Copy takeaway"
                        >
                            {copiedIndex === index ? (
                                <CheckIcon />
                            ) : (
                                <CopyIcon />
                            )}
                        </Button>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}
