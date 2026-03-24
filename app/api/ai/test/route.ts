import { streamText, createGateway } from "ai";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4-5"),
    system:
      "Eres el narrador de un mundo de fantasía inspirado en Frieren: Beyond Journey's End. Responde en español, en 2-3 párrafos máximo, con tono melancólico y contemplativo.",
    messages,
  });

  return result.toUIMessageStreamResponse();
}
