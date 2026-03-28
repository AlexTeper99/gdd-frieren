import { db } from "@/lib/db";
import { storyMemory } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { generateText, createGateway } from "ai";

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});

export async function updateNarrativeMemory(
  newEntryText: string,
  turnoNumero: number
) {
  // Get current memory
  const [currentMemory] = await db
    .select()
    .from(storyMemory)
    .orderBy(desc(storyMemory.createdAt))
    .limit(1);

  const previousResumen = currentMemory?.resumen ?? "No hay historia previa.";
  const previousWorldState = currentMemory?.worldState ?? {
    npcs: [],
    zonas: [],
    hilos_abiertos: [],
    hechos_inmutables: [],
  };

  // Use Claude to update summary + world state
  const { text } = await generateText({
    model: gateway("anthropic/claude-sonnet-4.5"),
    system: `Sos un asistente que mantiene la memoria narrativa de una novela colaborativa.
Tu trabajo es actualizar el resumen y el estado del mundo después de cada nueva entrada.

Respondé EXACTAMENTE en este formato JSON (sin markdown, sin backticks):
{
  "resumen": "resumen actualizado en ~20 oraciones máximo",
  "world_state": {
    "npcs": [{"nombre": "...", "estado": "...", "ultima_aparicion": N}],
    "zonas": [{"nombre": "...", "estado": "..."}],
    "hilos_abiertos": ["..."],
    "hechos_inmutables": ["..."]
  }
}`,
    prompt: `RESUMEN ANTERIOR:
${previousResumen}

WORLD STATE ANTERIOR:
${JSON.stringify(previousWorldState)}

NUEVA ENTRADA (turno ${turnoNumero}):
${newEntryText}

Actualizá el resumen incorporando lo nuevo. Actualizá el world state:
- Agregá NPCs nuevos o actualizá su estado
- Actualizá zonas si cambiaron
- Agregá hilos abiertos nuevos, cerrá los resueltos
- Agregá hechos inmutables si hay (muertes, zonas cerradas permanentemente)`,
  });

  try {
    const parsed = JSON.parse(text);

    await db.insert(storyMemory).values({
      resumen: parsed.resumen,
      worldState: parsed.world_state,
      updatedAtEntry: turnoNumero,
    });

    return parsed;
  } catch {
    // If parsing fails, just save the raw text as summary
    await db.insert(storyMemory).values({
      resumen: text.slice(0, 2000),
      worldState: previousWorldState,
      updatedAtEntry: turnoNumero,
    });
    return null;
  }
}
