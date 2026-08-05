"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
    BotIcon,
    DownloadIcon,
    GlobeIcon,
    MessageSquarePlusIcon,
    Trash2Icon,
} from "lucide-react";
import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
    MessageGroup,
} from "@/components/ui/message";
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    buildCitationMap,
    chatKeys,
    useConversationMessages,
    useConversations,
    useCreateConversation,
    useDeleteConversation,
} from "../hooks/use-conversations";
import { ChatMessageBody } from "./chat-message-body";
import { CitationSources } from "./citation-sources";
import { ChatComposer } from "./chat-composer";
import type { ChatCitation } from "../lib/types";
import { workspaceRoutes } from "@/features/workspaces/lib/routes";
import { useChatPreferences } from "../stores/chat-preferences";
import {
    downloadMarkdown,
    exportConversationMarkdown,
} from "../lib/export-chat";

type WorkspaceChatProps = {
    workspaceId: string;
    defaultModel?: string;
};

function getMessageText(message: UIMessage) {
    return message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
}

export function WorkspaceChat({
    workspaceId,
    defaultModel,
}: WorkspaceChatProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const askPrompt = searchParams.get("ask");
    const handledAskPrompt = useRef<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [citationsByMessageId, setCitationsByMessageId] = useState<
        Record<string, ChatCitation[]>
    >({});

    const getPrefs = useChatPreferences((state) => state.getPrefs);
    const setWebSearch = useChatPreferences((state) => state.setWebSearch);
    const chatPrefs = getPrefs(workspaceId, defaultModel);

    const { data: conversations = [], isLoading: conversationsLoading } =
        useConversations(workspaceId);
    const { data: storedMessages, isLoading: messagesLoading } =
        useConversationMessages(workspaceId, conversationId);
    const createConversation = useCreateConversation(workspaceId);
    const deleteConversation = useDeleteConversation(workspaceId);

    const activeConversation = conversations.find(
        (conversation) => conversation.id === conversationId,
    );

    const handleConversationId = useCallback(
        (id: string) => {
            setConversationId(id);
            void queryClient.invalidateQueries({
                queryKey: chatKeys(workspaceId).conversations(),
            });
        },
        [queryClient, workspaceId],
    );

    const transport = useMemo(
        () =>
            new DefaultChatTransport({
                api: `/api/workspaces/${workspaceId}/chat`,
                credentials: "include",
                body: {
                    ...(conversationId ? { conversationId } : {}),
                    model: chatPrefs.model,
                    webSearch: chatPrefs.webSearch,
                },
                fetch: async (url, init) => {
                    const response = await fetch(url, {
                        ...init,
                        credentials: "include",
                    });

                    const newConversationId =
                        response.headers.get("X-Conversation-Id");
                    if (newConversationId) {
                        handleConversationId(newConversationId);
                    }

                    return response;
                },
            }),
        [
            workspaceId,
            conversationId,
            handleConversationId,
            chatPrefs.model,
            chatPrefs.webSearch,
        ],
    );

    const { messages, sendMessage, setMessages, status, error } = useChat({
        transport,
    });

    const isStreaming = status === "streaming" || status === "submitted";

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setCitationsByMessageId({});
            return;
        }

        if (!storedMessages || isStreaming) {
            return;
        }

        setMessages(
            storedMessages.map((message) => ({
                id: message.id,
                role: message.role === "USER" ? "user" : "assistant",
                parts: [{ type: "text" as const, text: message.content }],
            })),
        );
        setCitationsByMessageId(buildCitationMap(storedMessages));
    }, [conversationId, storedMessages, setMessages, isStreaming]);

    useEffect(() => {
        if (status !== "ready" || !conversationId) {
            return;
        }

        void queryClient.invalidateQueries({
            queryKey: chatKeys(workspaceId).messages(conversationId),
        });
    }, [status, conversationId, queryClient, workspaceId]);

    useEffect(() => {
        if (!storedMessages || status === "streaming") {
            return;
        }

        setCitationsByMessageId(buildCitationMap(storedMessages));
    }, [storedMessages, status]);

    useEffect(() => {
        if (
            !askPrompt ||
            status !== "ready" ||
            conversationId ||
            messages.length > 0 ||
            handledAskPrompt.current === askPrompt
        ) {
            return;
        }

        handledAskPrompt.current = askPrompt;
        void sendMessage({ text: askPrompt });
        router.replace(workspaceRoutes.detail(workspaceId));
    }, [
        askPrompt,
        status,
        conversationId,
        messages.length,
        sendMessage,
        router,
        workspaceId,
    ]);

    async function handleNewChat() {
        setConversationId(null);
        setMessages([]);
        setCitationsByMessageId({});
    }

    async function handleDeleteConversation() {
        if (!conversationId) {
            return;
        }

        await deleteConversation.mutateAsync(conversationId);
        await handleNewChat();
    }

    function handleExportChat() {
        if (messages.length === 0) {
            return;
        }

        const markdown = exportConversationMarkdown({
            conversation: activeConversation ?? null,
            messages,
            citationsByMessageId,
        });
        const slug =
            activeConversation?.title?.replace(/[^\w-]+/g, "-").toLowerCase() ??
            "chat";
        downloadMarkdown(markdown, `${slug}-${Date.now()}.md`);
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-2 border-b px-4 py-3">
                <Select
                    value={conversationId ?? "new"}
                    onValueChange={(value) => {
                        if (value === "new") {
                            void handleNewChat();
                            return;
                        }
                        setConversationId(value);
                    }}
                >
                    <SelectTrigger className="max-w-sm flex-1">
                        <SelectValue placeholder="Select conversation" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="new">New chat</SelectItem>
                        {conversations.map((conversation) => (
                            <SelectItem
                                key={conversation.id}
                                value={conversation.id}
                            >
                                {conversation.title ?? "Untitled chat"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleNewChat()}
                >
                    <MessageSquarePlusIcon />
                    New
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={messages.length === 0}
                    onClick={handleExportChat}
                >
                    <DownloadIcon />
                    Export
                </Button>

                {conversationId ? (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void handleDeleteConversation()}
                        disabled={deleteConversation.isPending}
                    >
                        <Trash2Icon />
                    </Button>
                ) : null}
            </div>

            <MessageScrollerProvider>
                <MessageScroller className="min-h-0 flex-1">
                    <MessageScrollerViewport>
                        <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
                            {conversationsLoading || messagesLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-16 w-2/3 rounded-3xl" />
                                    <Skeleton className="ml-auto h-16 w-1/2 rounded-3xl" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                                    <div className="rounded-full bg-muted p-3">
                                        <BotIcon className="size-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            Chat with your sources
                                        </p>
                                        <p className="max-w-sm text-sm text-muted-foreground">
                                            Ask questions about the materials
                                            in this workspace. Answers include
                                            citations when relevant context is
                                            found.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <MessageGroup className="gap-6">
                                    {messages.map((message, messageIndex) => {
                                        const isUser = message.role === "user";
                                        const citations =
                                            citationsByMessageId[message.id];
                                        const isLastMessage =
                                            messageIndex === messages.length - 1;
                                        const isAnimatingMessage =
                                            !isUser &&
                                            isStreaming &&
                                            isLastMessage;

                                        return (
                                            <MessageScrollerItem
                                                key={message.id}
                                                scrollAnchor
                                            >
                                                <Message
                                                    align={
                                                        isUser ? "end" : "start"
                                                    }
                                                >
                                                    {!isUser ? (
                                                        <MessageAvatar className="size-8">
                                                            <BotIcon className="size-4" />
                                                        </MessageAvatar>
                                                    ) : null}
                                                    <MessageContent>
                                                        <Bubble
                                                            align={
                                                                isUser
                                                                    ? "end"
                                                                    : "start"
                                                            }
                                                            variant={
                                                                isUser
                                                                    ? "default"
                                                                    : "ghost"
                                                            }
                                                        >
                                                            <BubbleContent className="leading-relaxed">
                                                                {isUser ? (
                                                                    getMessageText(
                                                                        message,
                                                                    )
                                                                ) : (
                                                                    <ChatMessageBody
                                                                        text={getMessageText(
                                                                            message,
                                                                        )}
                                                                        citations={
                                                                            citations
                                                                        }
                                                                        workspaceId={
                                                                            workspaceId
                                                                        }
                                                                        isAnimating={
                                                                            isAnimatingMessage
                                                                        }
                                                                    />
                                                                )}
                                                            </BubbleContent>
                                                        </Bubble>
                                                        {!isUser &&
                                                        citations?.length ? (
                                                            <MessageFooter className="mt-1 w-full max-w-full flex-col items-start gap-0 px-0">
                                                                <CitationSources
                                                                    workspaceId={
                                                                        workspaceId
                                                                    }
                                                                    citations={
                                                                        citations
                                                                    }
                                                                />
                                                            </MessageFooter>
                                                        ) : null}
                                                    </MessageContent>
                                                </Message>
                                            </MessageScrollerItem>
                                        );
                                    })}
                                </MessageGroup>
                            )}
                        </MessageScrollerContent>
                    </MessageScrollerViewport>
                    <MessageScrollerButton direction="end" />
                </MessageScroller>
            </MessageScrollerProvider>

            {error ? (
                <div className="border-t bg-destructive/5 px-4 py-2 text-sm text-destructive">
                    {error.message}
                </div>
            ) : null}

            <ChatComposer
                disabled={createConversation.isPending}
                isStreaming={isStreaming}
                webSearchEnabled={chatPrefs.webSearch}
                onWebSearchChange={(enabled) =>
                    setWebSearch(workspaceId, enabled)
                }
                onSubmit={(text) => {
                    void sendMessage({ text });
                }}
            />
        </div>
    );
}
