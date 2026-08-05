"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { Workspace } from "../lib/types";

const ICON_OPTIONS = ["📚", "📖", "📝", "🎓", "💡", "🔬", "🧠", "✨"];

type WorkspaceFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspace?: Workspace | null;
    onSubmit: (values: {
        title: string;
        description?: string;
        icon?: string;
    }) => Promise<void>;
    isPending?: boolean;
};

export function WorkspaceFormDialog({
    open,
    onOpenChange,
    workspace,
    onSubmit,
    isPending = false,
}: WorkspaceFormDialogProps) {
    const isEditing = Boolean(workspace);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("📚");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setTitle(workspace?.title ?? "");
            setDescription(workspace?.description ?? "");
            setIcon(workspace?.icon ?? "📚");
            setError(null);
        }
    }, [open, workspace]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("Title is required.");
            return;
        }

        try {
            await onSubmit({
                title: trimmedTitle,
                description: description.trim() || undefined,
                icon,
            });
            onOpenChange(false);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Something went wrong.",
            );
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit notebook" : "Create notebook"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update your notebook details."
                            : "Start a new notebook to organize your sources and chats."}
                    </DialogDescription>
                </DialogHeader>

                <form className="grid gap-4" onSubmit={(e) => void handleSubmit(e)}>
                    <div className="grid gap-2">
                        <Label htmlFor="workspace-icon">Icon</Label>
                        <div className="flex flex-wrap gap-2">
                            {ICON_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setIcon(option)}
                                    className={`flex size-10 items-center justify-center rounded-lg border text-lg transition-colors ${
                                        icon === option
                                            ? "border-primary bg-primary/10"
                                            : "border-border hover:bg-muted"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="workspace-title">Title</Label>
                        <Input
                            id="workspace-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="My research notebook"
                            maxLength={120}
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="workspace-description">
                            Description
                        </Label>
                        <Textarea
                            id="workspace-description"
                            value={description}
                            onChange={(event) =>
                                setDescription(event.target.value)
                            }
                            placeholder="What is this workspace about?"
                            maxLength={500}
                            rows={3}
                            disabled={isPending}
                        />
                    </div>

                    {error ? (
                        <p className="text-sm text-destructive">{error}</p>
                    ) : null}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? <Spinner /> : null}
                            {isEditing ? "Save changes" : "Create workspace"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
