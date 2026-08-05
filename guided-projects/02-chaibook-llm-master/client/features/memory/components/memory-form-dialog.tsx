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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { UserMemory } from "../lib/types";

type MemoryFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    memory?: UserMemory | null;
    onSubmit: (values: { memory: string }) => Promise<void>;
    isPending?: boolean;
};

export function MemoryFormDialog({
    open,
    onOpenChange,
    memory,
    onSubmit,
    isPending = false,
}: MemoryFormDialogProps) {
    const isEditing = Boolean(memory);
    const [value, setValue] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setValue(memory?.memory ?? "");
            setError(null);
        }
    }, [open, memory]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const trimmedValue = value.trim();

        if (!trimmedValue) {
            setError("Memory text is required.");
            return;
        }

        try {
            await onSubmit({ memory: trimmedValue });
            onOpenChange(false);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Could not save memory.",
            );
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <form onSubmit={(event) => void handleSubmit(event)}>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditing ? "Edit memory" : "Add memory"}
                        </DialogTitle>
                        <DialogDescription>
                            Memories are stored in Mem0 and injected into chat
                            when relevant.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="memory-value">Memory</Label>
                            <Textarea
                                id="memory-value"
                                value={value}
                                onChange={(event) =>
                                    setValue(event.target.value)
                                }
                                placeholder="Prefers concise explanations with examples"
                                rows={5}
                            />
                        </div>
                        {error ? (
                            <p className="text-sm text-destructive">{error}</p>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isEditing ? "Save" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
