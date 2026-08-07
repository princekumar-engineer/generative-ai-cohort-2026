# ChaiGPT

A ChatGPT-style AI chat app built with Next.js. Sign in, start a conversation, and stream replies from an OpenAI model in real time — with persistent history, a sidebar of chats, pin/rename/delete, and light/dark theming.

## Tech stack

| Layer          | Choice                                                              |
| -------------- | -------------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (App Router, Server Actions)        |
| Language       | TypeScript                                                            |
| Auth           | [Clerk](https://clerk.com)                                            |
| Database       | PostgreSQL via [Prisma](https://www.prisma.io) (`@prisma/adapter-pg`) |
| AI / streaming | [Vercel AI SDK](https://ai-sdk.dev) + `@ai-sdk/openai`                |
| Data fetching  | [TanStack Query](https://tanstack.com/query)                         |
| UI             | Tailwind CSS v4, shadcn/ui, Base UI, `next-themes`                   |

## Features

- Email/social sign-in with Clerk; users are synced into the database on first visit.
- Create, rename, pin, archive, and delete conversations from the sidebar.
- Streaming AI responses (via `POST /api/chat`) with messages persisted to Postgres as they arrive.
- Optimistic-friendly caching and invalidation with TanStack Query.
- Light/dark theme toggle.

## Project structure

Application code is organized **by feature**, not by file type. Each feature under `features/` owns its own `actions/` (Next.js Server Actions), `hooks/` (TanStack Query hooks), `components/` (feature-specific UI), and `utils/`:

```
features/
├── auth/            Clerk-backed auth helpers (requireUser, onBoard)
├── conversation/     Conversation CRUD, sidebar UI, chat shell layout
├── messages/         Message CRUD, chat thread UI (composer, bubbles, empty state)
├── ai/               Chat model config + AI SDK message persistence (chat-store)
└── home/             Logic for the "/" route (starts a new chat)
```

Each feature exposes a barrel `index.ts` so you can import from the feature root, e.g.:

```ts
import { useConversations } from "@/features/conversation";
```

Everything else follows standard Next.js App Router conventions:

```
app/
├── (auth)/                 Sign-in route group (public)
├── (root)/                 Authenticated route group
│   ├── layout.tsx          Protects routes, runs onboarding, renders ChatShell
│   ├── page.tsx            "/" → creates a new chat and redirects to it
│   └── c/[id]/page.tsx      "/c/:id" → loads a conversation + its messages
├── api/chat/route.ts        Streaming chat endpoint (AI SDK)
└── layout.tsx               Root layout: Clerk, React Query, theme, toasts

components/
├── ui/                      shadcn/ui primitives (button, dialog, sidebar, ...)
├── ai-elements/              AI SDK UI building blocks (message, conversation, loader)
└── providers/                App-wide providers (React Query, theme)

lib/                          Shared, non-feature infra (db client, query key factory, cn util)
prisma/                       Schema + migrations
```

When adding new functionality, prefer creating/extending a feature folder over dropping files into `lib/` or `components/` — those are reserved for truly cross-feature/shared code.

## Getting started

### Prerequisites

- Node.js 20+ (or [Bun](https://bun.sh), which this repo also supports via `bun.lock`)
- A PostgreSQL database
- A [Clerk](https://dashboard.clerk.com) application
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

| Variable                            | Description                                            |
| ------------------------------------ | -------------------------------------------------------- |
| `DATABASE_URL`                       | PostgreSQL connection string                              |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Clerk publishable key                                      |
| `CLERK_SECRET_KEY`                   | Clerk secret key                                            |
| `OPENAI_API_KEY`                     | OpenAI API key used for chat completions                   |

### 3. Set up the database

```bash
npx prisma migrate dev
```

This applies the migrations in `prisma/migrations` and generates the Prisma client into `lib/generated/prisma`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Signing in for the first time will sync your Clerk account into the database and drop you into a fresh chat.

## Available scripts

| Script          | Description                        |
| ---------------- | ------------------------------------- |
| `npm run dev`     | Start the Next.js dev server          |
| `npm run build`   | Production build                      |
| `npm run start`   | Start the production server           |
| `npm run lint`    | Run ESLint                            |

## Database

The schema (`prisma/schema.prisma`) has three models:

- **User** — mirrors the Clerk user (`clerkId` is the link back to Clerk).
- **Conversation** — a chat thread; tracks title, pin/archive state, and `lastMessageAt` for sidebar ordering.
- **Message** — a single turn in a conversation; stores both plain `content` and the raw AI SDK `parts` (text/tool calls/etc.) so the UI can be fully reconstructed.

Run `npx prisma studio` to browse data locally.
