import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateText, createGateway } from "ai";
import { buildSystemPrompt } from "@/lib/prompts";
import { buildNarrativeContext } from "@/lib/prompts/build-context";
import { updateNarrativeMemory } from "@/lib/narrative/memory";
import { db } from "@/lib/db";
import { storyEntries, users, rituals } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trigger, textoJugador } = await request.json();

  if (trigger !== "prologo" && trigger !== "diario") {
    return NextResponse.json({ error: "Invalid trigger" }, { status: 400 });
  }

  // Build context
  const context = await buildNarrativeContext(
    session.user.id,
    trigger,
    textoJugador ?? null
  );

  // Build user message with all context data
  const userMessage = `${context.resumen ? `RESUMEN DE LA HISTORIA:\n${context.resumen}\n\n` : ""}${
    context.worldState
      ? `ESTADO DEL MUNDO:\n${JSON.stringify(context.worldState)}\n\n`
      : ""
  }${
    context.entradasRecientes.length > 0
      ? `ENTRADAS RECIENTES:\n${context.entradasRecientes.join("\n\n")}\n\n`
      : ""
  }JUGADOR ACTIVO:
${JSON.stringify(context.jugadorActivo)}

${context.otroJugador ? `OTRO JUGADOR:\n${JSON.stringify(context.otroJugador)}\n\n` : ""}${
    context.textoJugador
      ? `TEXTO DEL JUGADOR:\n${context.textoJugador}`
      : "Generá el prólogo del personaje."
  }`;

  // Generate narrative
  const { text } = await generateText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    system: buildSystemPrompt(trigger),
    prompt: userMessage,
  });

  // Get next turno number
  const [lastEntry] = await db
    .select({ turnoNumero: storyEntries.turnoNumero })
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  const nextTurno = (lastEntry?.turnoNumero ?? 0) + 1;
  const today = new Date().toISOString().split("T")[0];

  // Build snapshots
  const allUsers = await db.select().from(users);
  const buildSnapshot = async (user: (typeof allUsers)[0]) => {
    const userRituals = await db
      .select({ descripcion: rituals.descripcion, racha: rituals.racha })
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));
    return {
      hp: user.hp,
      rituales: userRituals.map((r) => ({
        nombre: r.descripcion,
        racha: r.racha,
      })),
    };
  };

  const snapshotJ1 = await buildSnapshot(allUsers[0]);
  const snapshotJ2 = allUsers[1] ? await buildSnapshot(allUsers[1]) : null;

  // Save story entry
  await db.insert(storyEntries).values({
    userId: session.user.id,
    fecha: today,
    turnoNumero: nextTurno,
    textoJugador: textoJugador ?? null,
    textoIa: text,
    snapshotJ1,
    snapshotJ2,
  });

  // Update narrative memory (async, don't block response)
  const fullEntry = `${textoJugador ? `Jugador: ${textoJugador}\n\n` : ""}IA: ${text}`;
  updateNarrativeMemory(fullEntry, nextTurno).catch(console.error);

  return NextResponse.json({ text, turnoNumero: nextTurno });
}
