"use server";

import { db } from "@/lib/db";
import { storyEntries, users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getStoryState(userId: string) {
  // Get last entry to determine turn
  const [lastEntry] = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  if (!lastEntry) {
    return { isMyTurn: true, lastEntry: null, entries: [] };
  }

  // Alternating turns: if last entry was by other player, it's my turn
  const isMyTurn = lastEntry.userId !== userId;

  // Get recent entries for display
  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(10);

  // Get user names
  const allUsers = await db.select({ id: users.id, nombre: users.nombrePersonaje }).from(users);
  const nameMap = Object.fromEntries(allUsers.map((u) => [u.id, u.nombre]));

  return {
    isMyTurn,
    lastEntry: lastEntry
      ? {
          ...lastEntry,
          autorNombre: nameMap[lastEntry.userId] ?? "Desconocido",
        }
      : null,
    entries: entries.reverse().map((e) => ({
      ...e,
      autorNombre: nameMap[e.userId] ?? "Desconocido",
    })),
  };
}
