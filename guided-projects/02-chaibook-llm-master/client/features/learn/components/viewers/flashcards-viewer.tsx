"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    RefreshCwIcon,
    RotateCcwIcon,
    ShuffleIcon,
    SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { StreamdownContent } from "@/shared/components/streamdown-content";
import type { Flashcard } from "../../lib/types";

const SWIPE_THRESHOLD = 90;
const SWIPE_VELOCITY = 400;

const cardVariants = {
    enter: (direction: number) => ({
        x: direction >= 0 ? 260 : -260,
        opacity: 0,
        scale: 0.92,
        rotate: direction >= 0 ? 4 : -4,
    }),
    center: { x: 0, opacity: 1, scale: 1, rotate: 0 },
    exit: (direction: number) => ({
        x: direction >= 0 ? -260 : 260,
        opacity: 0,
        scale: 0.92,
        rotate: direction >= 0 ? -4 : 4,
    }),
};

function shuffleOrder(length: number) {
    const order = Array.from({ length }, (_, index) => index);

    for (let i = order.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }

    return order;
}

export function FlashcardsViewer({ cards }: { cards: Flashcard[] }) {
    const [order, setOrder] = useState(() =>
        Array.from({ length: cards.length }, (_, index) => index),
    );
    const [position, setPosition] = useState(0);
    const [direction, setDirection] = useState(1);
    const [flipped, setFlipped] = useState(false);
    const [known, setKnown] = useState<Set<number>>(new Set());
    const dragged = useRef(false);

    useEffect(() => {
        setOrder(Array.from({ length: cards.length }, (_, index) => index));
        setPosition(0);
        setFlipped(false);
        setKnown(new Set());
    }, [cards]);

    const cardIndex = order[position];
    const card = cards[cardIndex];

    const goTo = useCallback(
        (nextDirection: number) => {
            if (cards.length === 0) {
                return;
            }

            setDirection(nextDirection);
            setFlipped(false);
            setPosition((current) => {
                const next = current + nextDirection;
                return (next + cards.length) % cards.length;
            });
        },
        [cards.length],
    );

    const flip = useCallback(() => setFlipped((value) => !value), []);

    const markKnown = useCallback(() => {
        setKnown((current) => {
            const next = new Set(current);
            next.add(cardIndex);
            return next;
        });
        goTo(1);
    }, [cardIndex, goTo]);

    const markUnknown = useCallback(() => {
        setKnown((current) => {
            if (!current.has(cardIndex)) {
                return current;
            }
            const next = new Set(current);
            next.delete(cardIndex);
            return next;
        });
        goTo(1);
    }, [cardIndex, goTo]);

    const shuffle = useCallback(() => {
        setOrder(shuffleOrder(cards.length));
        setPosition(0);
        setDirection(1);
        setFlipped(false);
    }, [cards.length]);

    const restart = useCallback(() => {
        setOrder(Array.from({ length: cards.length }, (_, index) => index));
        setPosition(0);
        setDirection(1);
        setFlipped(false);
        setKnown(new Set());
    }, [cards.length]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            if (
                target &&
                ["INPUT", "TEXTAREA"].includes(target.tagName)
            ) {
                return;
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                goTo(1);
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                goTo(-1);
            } else if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                flip();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [goTo, flip]);

    const handleDragEnd = useCallback(
        (_event: unknown, info: PanInfo) => {
            const { offset, velocity } = info;

            if (
                offset.x < -SWIPE_THRESHOLD ||
                velocity.x < -SWIPE_VELOCITY
            ) {
                goTo(1);
            } else if (
                offset.x > SWIPE_THRESHOLD ||
                velocity.x > SWIPE_VELOCITY
            ) {
                goTo(-1);
            }

            window.setTimeout(() => {
                dragged.current = false;
            }, 0);
        },
        [goTo],
    );

    const progress = useMemo(
        () => (cards.length ? (known.size / cards.length) * 100 : 0),
        [known.size, cards.length],
    );

    if (!card) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                This deck has no cards.
            </p>
        );
    }

    const isKnown = known.has(cardIndex);
    const allKnown = known.size === cards.length;

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground tabular-nums">
                        Card {position + 1} of {cards.length}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground tabular-nums">
                        <SparklesIcon className="size-3.5" />
                        {known.size} learned
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                        className="h-full rounded-full bg-primary"
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 220, damping: 30 }}
                    />
                </div>
            </div>

            <div className="relative h-72 perspective-[1600px]">
                <div
                    aria-hidden
                    className="absolute inset-x-6 top-3 h-full rounded-3xl border border-border/50 bg-card/40"
                />
                <div
                    aria-hidden
                    className="absolute inset-x-3 top-1.5 h-full rounded-3xl border border-border/70 bg-card/60"
                />

                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={position}
                        custom={direction}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 32,
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.35}
                        onDragStart={() => {
                            dragged.current = true;
                        }}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                        <motion.div
                            className="relative size-full"
                            style={{ transformStyle: "preserve-3d" }}
                            animate={{ rotateY: flipped ? 180 : 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 26,
                            }}
                            onClick={() => {
                                if (dragged.current) {
                                    return;
                                }
                                flip();
                            }}
                        >
                            <CardFace
                                side="Front"
                                content={card.front}
                                isKnown={isKnown}
                            />
                            <CardFace
                                side="Back"
                                content={card.back}
                                isKnown={isKnown}
                                back
                            />
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(-1)}
                    aria-label="Previous card"
                >
                    <ChevronLeftIcon />
                    Previous
                </Button>

                <Button variant="ghost" size="sm" onClick={flip}>
                    <RotateCcwIcon />
                    Flip
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goTo(1)}
                    aria-label="Next card"
                >
                    Next
                    <ChevronRightIcon />
                </Button>
            </div>

            <AnimatePresence initial={false}>
                {flipped ? (
                    <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={markUnknown}
                            >
                                <RefreshCwIcon />
                                Still learning
                            </Button>
                            <Button className="flex-1" onClick={markKnown}>
                                <CheckIcon />
                                Got it
                            </Button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Kbd>←</Kbd>
                    <Kbd>→</Kbd>
                    to navigate
                    <Kbd className="ml-1.5">Space</Kbd>
                    to flip, or swipe the card
                </p>
                <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={shuffle}>
                        <ShuffleIcon />
                        Shuffle
                    </Button>
                    <Button variant="ghost" size="sm" onClick={restart}>
                        <RotateCcwIcon />
                        Restart
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {allKnown ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-center text-sm"
                    >
                        You have marked every card as learned. Nice work.
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

function CardFace({
    side,
    content,
    isKnown,
    back = false,
}: {
    side: string;
    content: string;
    isKnown: boolean;
    back?: boolean;
}) {
    return (
        <div
            className={`absolute inset-0 flex flex-col overflow-hidden rounded-3xl border bg-card p-6 shadow-lg backface-hidden ${
                isKnown ? "border-primary/50" : "border-border"
            } ${back ? "transform-[rotateY(180deg)]" : ""}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs tracking-wider text-muted-foreground uppercase">
                    {side}
                </span>
                {isKnown ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                        <CheckIcon className="size-3.5" />
                        Learned
                    </span>
                ) : null}
            </div>

            <div className="flex flex-1 items-center justify-center overflow-y-auto py-4">
                <StreamdownContent
                    content={content}
                    className="prose prose-sm dark:prose-invert max-w-none text-center [&_p]:my-0 [&_p+p]:mt-3"
                />
            </div>
        </div>
    );
}
