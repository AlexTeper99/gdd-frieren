import { NextResponse } from "next/server";
import { auth } from "@/features/shared/auth";
import { resolveUserId } from "@/features/shared/auth/dal";
import { generateText, createGateway } from "ai";
import { buildSystemPrompt } from "@/features/story/prompts";
import { buildNarrativeContext } from "@/features/story/prompts/build-context";
import { updateNarrativeMemory } from "@/features/story/memory";
import { db } from "@/features/shared/db";
import { storyEntries, users, rituals } from "@/features/shared/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { getLocalDate } from "@/features/shared/constants";
import { getStoryState } from "@/features/story/actions";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export async function POST(request: Request) {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trigger, textoJugador } = await request.json();

  if (trigger !== "prologo" && trigger !== "diario") {
    return NextResponse.json({ error: "Invalid trigger" }, { status: 400 });
  }

  // Server-side turn validation (prevent out-of-turn writes)
  if (trigger === "diario") {
    const storyState = await getStoryState(userId);
    if (!storyState.isMyTurn) {
      return NextResponse.json(
        { error: "No es tu turno de escribir" },
        { status: 403 }
      );
    }
  }

  // Build context
  const context = await buildNarrativeContext(
    userId,
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
  let text: string;
  try {
    const result = await generateText({
      model: gateway("anthropic/claude-sonnet-4.6"),
      system: buildSystemPrompt(trigger),
      prompt: userMessage,
    });
    text = result.text;
  } catch (error) {
    console.error("[Story] AI generation failed:", error);
    return NextResponse.json(
      { error: "No se pudo generar la continuación. Intentá de nuevo." },
      { status: 500 }
    );
  }

  // Get next turno number
  const [lastEntry] = await db
    .select({ turnoNumero: storyEntries.turnoNumero })
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  const nextTurno = (lastEntry?.turnoNumero ?? 0) + 1;
  const today = getLocalDate();

  // Build snapshots
  const allUsers = await db.select().from(users).orderBy(asc(users.id));
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
    userId,
    fecha: today,
    turnoNumero: nextTurno,
    tipo: trigger,
    textoJugador: textoJugador ?? null,
    textoIa: text,
    snapshotJ1,
    snapshotJ2,
  });

  // Update narrative memory (async, don't block response)
  const fullEntry = `${textoJugador ? `Jugador: ${textoJugador}\n\n` : ""}IA: ${text}`;
  try {
    await updateNarrativeMemory(fullEntry, nextTurno);
  } catch (error) {
    console.error("[Story] Memory update failed:", error);
  }

  return NextResponse.json({ text, turnoNumero: nextTurno });
}
