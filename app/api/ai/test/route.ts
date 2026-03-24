import { streamText, createGateway, UIMessage } from "ai";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  // Convert UIMessage[] (parts-based) to CoreMessage[] (content-based)
  const coreMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join(""),
  }));

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4-5"),
    system:
      "Eres el narrador de un mundo de fantasía inspirado en Frieren: Beyond Journey's End. Responde en español, en 2-3 párrafos máximo, con tono melancólico y contemplativo.",
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
}
