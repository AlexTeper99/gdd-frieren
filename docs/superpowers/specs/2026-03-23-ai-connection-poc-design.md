# AI Connection PoC Design

**Date:** 2026-03-23
**Purpose:** Validate Claude API connection via Vercel AI SDK before Phase 2 narrative implementation.

---

## Scope

Proof of concept only. A streaming AI endpoint + test page to confirm the connection works. Will be removed when Phase 2 narrative route is built.

## Stack

- Vercel AI SDK (`ai` package) — streaming, `useChat()` hook
- `@ai-sdk/anthropic` — Claude provider for AI SDK
- Model: `claude-sonnet-4-5`

## Route Handler (`app/api/ai/test/route.ts`)

- POST with `{ messages }` (useChat sends this format)
- `streamText()` with hardcoded Frieren-style system prompt
- Returns `result.toDataStreamResponse()`

## Test Page (`app/(app)/test-ai/page.tsx`)

- Client component with `useChat()` from `ai/react`
- Textarea + send button, streamed response display
- Protected by `(app)` layout (requires session)
- Temporary — removed in Phase 2

## Env Vars

- Local: `ANTHROPIC_API_KEY` (direct to Anthropic)
- Vercel prod: AI Gateway routes automatically

## System Prompt

"Eres el narrador de un mundo de fantasía inspirado en Frieren: Beyond Journey's End. Responde en español, en 2-3 párrafos máximo, con tono melancólico y contemplativo."

## Out of Scope

- Context builder, stats integration, narrative triggers (Phase 2-3)
- Prompt engineering / calibration (Phase 1.8)
- Persistent scene storage (Phase 2.5)
