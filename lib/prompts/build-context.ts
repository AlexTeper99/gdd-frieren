import { db } from "@/lib/db";
import {
  users,
  rituals,
  storyEntries,
  storyMemory,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import type { NarrativeContext, PlayerContext } from "./types";

export async function buildNarrativeContext(
  activeUserId: string,
  trigger: "prologo" | "diario",
  textoJugador: string | null
): Promise<NarrativeContext> {
  // Get both users
  const allUsers = await db.select().from(users);
  const activeUser = allUsers.find((u) => u.id === activeUserId)!;
  const otherUser = allUsers.find((u) => u.id !== activeUserId);

  // Build player contexts
  async function buildPlayerContext(
    user: typeof activeUser
  ): Promise<PlayerContext> {
    const userRituals = await db
      .select({ descripcion: rituals.descripcion, racha: rituals.racha })
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

    return {
      nombre: user.nombrePersonaje ?? "Desconocido",
      arquetipo: user.arquetipo ?? "mago",
      identidad: user.identidadTexto ?? "",
      hp: user.hp,
      rituales: userRituals.map((r) => ({
        nombre: r.descripcion,
        racha: r.racha,
      })),
    };
  }

  const jugadorActivo = await buildPlayerContext(activeUser);
  const otroJugador = otherUser
    ? await buildPlayerContext(otherUser)
    : null;

  // Get memory
  const [memory] = await db
    .select()
    .from(storyMemory)
    .orderBy(desc(storyMemory.createdAt))
    .limit(1);

  // Get last 5 entries
  const recentEntries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(5);

  const entradasRecientes = recentEntries
    .reverse()
    .map(
      (e) =>
        `[Turno ${e.turnoNumero}] Jugador: ${e.textoJugador ?? "(prólogo)"}\nIA: ${e.textoIa ?? ""}`
    );

  return {
    trigger,
    jugadorActivo,
    otroJugador,
    textoJugador,
    resumen: memory?.resumen ?? null,
    worldState: (memory?.worldState as NarrativeContext["worldState"]) ?? null,
    entradasRecientes,
  };
}
