import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250514"),
    system:
      "Eres el narrador de un mundo de fantasía inspirado en Frieren: Beyond Journey's End. Responde en español, en 2-3 párrafos máximo, con tono melancólico y contemplativo.",
    messages,
  });

  return result.toUIMessageStreamResponse();
}
