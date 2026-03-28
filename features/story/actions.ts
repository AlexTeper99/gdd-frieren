"use server";

import { db } from "@/features/shared/db";
import { storyEntries, users } from "@/features/shared/db/schema";
import { desc, eq, asc } from "drizzle-orm";

const TURN_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getStoryState(userId: string) {
  const [lastDiarioEntry] = await db
    .select()
    .from(storyEntries)
    .where(eq(storyEntries.tipo, "diario"))
    .orderBy(desc(storyEntries.turnoNumero))
    .limit(1);

  let isMyTurn: boolean;

  if (!lastDiarioEntry) {
    isMyTurn = true;
  } else if (lastDiarioEntry.userId !== userId) {
    isMyTurn = true;
  } else {
    const entryAge = Date.now() - new Date(lastDiarioEntry.createdAt).getTime();
    isMyTurn = entryAge > TURN_TIMEOUT_MS;
  }

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

export async function getStoryArchive(page: number = 1, pageSize: number = 20) {
  const offset = (page - 1) * pageSize;

  const entries = await db
    .select()
    .from(storyEntries)
    .orderBy(asc(storyEntries.turnoNumero))
    .limit(pageSize)
    .offset(offset);

  const allUsers = await db
    .select({ id: users.id, nombre: users.nombrePersonaje })
    .from(users)
    .orderBy(asc(users.id));
  const nameMap = Object.fromEntries(
    allUsers.map((u) => [u.id, u.nombre ?? "Desconocido"])
  );

  const allEntries = await db.select({ id: storyEntries.id }).from(storyEntries);
  const totalCount = allEntries.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    entries: entries.map((e) => ({
      ...e,
      autorNombre: nameMap[e.userId] ?? "Desconocido",
    })),
    page,
    totalPages,
    totalCount,
  };
}
