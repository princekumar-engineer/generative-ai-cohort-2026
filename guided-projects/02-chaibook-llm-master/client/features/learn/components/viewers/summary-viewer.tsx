"use client";

import { StreamdownContent } from "@/shared/components/streamdown-content";

export function SummaryViewer({ markdown }: { markdown: string }) {
    return <StreamdownContent content={markdown} mode="static" />;
}
