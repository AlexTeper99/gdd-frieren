"use server";

import { db } from "@/lib/db";
import { storyEntries, users } from "@/lib/db/schema";
import { desc, eq, asc } from "drizzle-orm";

export async function getStoryState(userId: string) {
  const [lastDiarioEntry] = await db
    .select()
    .from(storyEntries)
    .where(eq(storyEntries.tipo, "diario"))
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  const isMyTurn = !lastDiarioEntry || lastDiarioEntry.userId !== userId;

  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(20);

  const allUsers = await db
    .select({ id: users.id, nombre: users.nombrePersonaje })
    .from(users)
    .orderBy(asc(users.id));
  const nameMap = Object.fromEntries(
    allUsers.map((u) => [u.id, u.nombre ?? "Desconocido"])
  );

  const lastEntry = entries[0] ?? null;

  return {
    isMyTurn,
    lastEntry: lastEntry
      ? { ...lastEntry, autorNombre: nameMap[lastEntry.userId] ?? "Desconocido" }
      : null,
    entries: entries.reverse().map((e) => ({
      ...e,
      autorNombre: nameMap[e.userId] ?? "Desconocido",
    })),
  };
}
