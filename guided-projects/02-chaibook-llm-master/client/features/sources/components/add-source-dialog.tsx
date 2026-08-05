"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
    useCreateSource,
    useImportWebsiteSource,
    useImportYoutubeSource,
    useUploadPdfSource,
} from "../hooks/use-sources";
import { sourceRoutes } from "../lib/routes";

type AddSourceDialogProps = {
    workspaceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AddSourceDialog({
    workspaceId,
    open,
    onOpenChange,
}: AddSourceDialogProps) {
    const router = useRouter();
    const createSource = useCreateSource(workspaceId);
    const uploadPdf = useUploadPdfSource(workspaceId);
    const importWebsite = useImportWebsiteSource(workspaceId);
    const importYoutube = useImportYoutubeSource(workspaceId);

    const [error, setError] = useState<string | null>(null);

    const [textTitle, setTextTitle] = useState("");
    const [textContent, setTextContent] = useState("");

    const [markdownTitle, setMarkdownTitle] = useState("");
    const [markdownContent, setMarkdownContent] = useState("");

    const [pdfTitle, setPdfTitle] = useState("");
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const [websiteUrl, setWebsiteUrl] = useState("");
    const [websiteTitle, setWebsiteTitle] = useState("");

    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [youtubeTitle, setYoutubeTitle] = useState("");

    const isPending =
        createSource.isPending ||
        uploadPdf.isPending ||
        importWebsite.isPending ||
        importYoutube.isPending;

    function resetForm() {
        setError(null);
        setTextTitle("");
        setTextContent("");
        setMarkdownTitle("");
        setMarkdownContent("");
        setPdfTitle("");
        setPdfFile(null);
        setWebsiteUrl("");
        setWebsiteTitle("");
        setYoutubeUrl("");
        setYoutubeTitle("");
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            resetForm();
        }
        onOpenChange(nextOpen);
    }

    async function handleSuccess(sourceId: string) {
        handleOpenChange(false);
        router.push(sourceRoutes.detail(workspaceId, sourceId));
        router.refresh();
    }

    async function submitText() {
        setError(null);
        try {
            const source = await createSource.mutateAsync({
                type: "TEXT",
                title: textTitle,
                content: textContent,
            });
            await handleSuccess(source.id);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Failed to add text source",
            );
        }
    }

    async function submitMarkdown() {
        setError(null);
        try {
            const source = await createSource.mutateAsync({
                type: "MARKDOWN",
                title: markdownTitle,
                content: markdownContent,
            });
            await handleSuccess(source.id);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Failed to add markdown source",
            );
        }
    }

    async function submitPdf() {
        setError(null);

        if (!pdfFile) {
            setError("Choose a PDF file to upload.");
            return;
        }

        try {
            const source = await uploadPdf.mutateAsync({
                file: pdfFile,
                title: pdfTitle || undefined,
            });
            await handleSuccess(source.id);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Failed to upload PDF",
            );
        }
    }

    async function submitWebsite() {
        setError(null);
        try {
            const source = await importWebsite.mutateAsync({
                url: websiteUrl,
                title: websiteTitle || undefined,
            });
            await handleSuccess(source.id);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Failed to import website",
            );
        }
    }

    async function submitYoutube() {
        setError(null);
        try {
            const source = await importYoutube.mutateAsync({
                url: youtubeUrl,
                title: youtubeTitle || undefined,
            });
            await handleSuccess(source.id);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Failed to import YouTube transcript",
            );
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Add source</DialogTitle>
                    <DialogDescription>
                        Add knowledge to this workspace from text, files, or
                        the web.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="text">
                    <TabsList className="w-full">
                        <TabsTrigger value="text">Text</TabsTrigger>
                        <TabsTrigger value="markdown">Markdown</TabsTrigger>
                        <TabsTrigger value="pdf">PDF</TabsTrigger>
                        <TabsTrigger value="website">Website</TabsTrigger>
                        <TabsTrigger value="youtube">YouTube</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="grid gap-4 pt-2">
                        <Field
                            id="text-title"
                            label="Title"
                            value={textTitle}
                            onChange={setTextTitle}
                            placeholder="Meeting notes"
                            disabled={isPending}
                        />
                        <FieldTextarea
                            id="text-content"
                            label="Content"
                            value={textContent}
                            onChange={setTextContent}
                            placeholder="Paste your text here..."
                            disabled={isPending}
                        />
                        <DialogFooter>
                            <SubmitButton
                                pending={createSource.isPending}
                                onClick={() => void submitText()}
                            >
                                Add text source
                            </SubmitButton>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="markdown" className="grid gap-4 pt-2">
                        <Field
                            id="markdown-title"
                            label="Title"
                            value={markdownTitle}
                            onChange={setMarkdownTitle}
                            placeholder="Research notes"
                            disabled={isPending}
                        />
                        <FieldTextarea
                            id="markdown-content"
                            label="Markdown"
                            value={markdownContent}
                            onChange={setMarkdownContent}
                            placeholder="# Heading&#10;&#10;Write markdown here..."
                            disabled={isPending}
                            rows={8}
                        />
                        <DialogFooter>
                            <SubmitButton
                                pending={createSource.isPending}
                                onClick={() => void submitMarkdown()}
                            >
                                Add markdown source
                            </SubmitButton>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="pdf" className="grid gap-4 pt-2">
                        <Field
                            id="pdf-title"
                            label="Title (optional)"
                            value={pdfTitle}
                            onChange={setPdfTitle}
                            placeholder="Research paper"
                            disabled={isPending}
                        />
                        <div className="grid gap-2">
                            <Label htmlFor="pdf-file">PDF file</Label>
                            <Input
                                id="pdf-file"
                                type="file"
                                accept="application/pdf"
                                disabled={isPending}
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setPdfFile(file);
                                }}
                            />
                            {pdfFile ? (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {pdfFile.name}
                                </p>
                            ) : null}
                        </div>
                        <DialogFooter>
                            <SubmitButton
                                pending={uploadPdf.isPending}
                                onClick={() => void submitPdf()}
                            >
                                Upload PDF
                            </SubmitButton>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="website" className="grid gap-4 pt-2">
                        <Field
                            id="website-url"
                            label="Website URL"
                            value={websiteUrl}
                            onChange={setWebsiteUrl}
                            placeholder="https://example.com/article"
                            disabled={isPending}
                        />
                        <Field
                            id="website-title"
                            label="Title (optional)"
                            value={websiteTitle}
                            onChange={setWebsiteTitle}
                            placeholder="Article title"
                            disabled={isPending}
                        />
                        <DialogFooter>
                            <SubmitButton
                                pending={importWebsite.isPending}
                                onClick={() => void submitWebsite()}
                            >
                                Import website
                            </SubmitButton>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="youtube" className="grid gap-4 pt-2">
                        <Field
                            id="youtube-url"
                            label="YouTube URL"
                            value={youtubeUrl}
                            onChange={setYoutubeUrl}
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={isPending}
                        />
                        <Field
                            id="youtube-title"
                            label="Title (optional)"
                            value={youtubeTitle}
                            onChange={setYoutubeTitle}
                            placeholder="Video title"
                            disabled={isPending}
                        />
                        <DialogFooter>
                            <SubmitButton
                                pending={importYoutube.isPending}
                                onClick={() => void submitYoutube()}
                            >
                                Import transcript
                            </SubmitButton>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>

                {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}

function Field({
    id,
    label,
    value,
    onChange,
    placeholder,
    disabled,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
}

function FieldTextarea({
    id,
    label,
    value,
    onChange,
    placeholder,
    disabled,
    rows = 6,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Textarea
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
            />
        </div>
    );
}

function SubmitButton({
    children,
    pending,
    onClick,
}: {
    children: React.ReactNode;
    pending: boolean;
    onClick: () => void;
}) {
    return (
        <Button type="button" disabled={pending} onClick={onClick}>
            {pending ? <Spinner /> : null}
            {children}
        </Button>
    );
}
