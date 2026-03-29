"use server";

import { db } from "@/features/shared/db";
import { rituals, ritualLogs, users } from "@/features/shared/db/schema";
import { verifySession } from "@/features/shared/auth/dal";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  HP_PER_RITUAL,
  HP_BONUS_STREAK,
  HP_STREAK_THRESHOLD,
  HP_MAX,
  getLocalDate,
  getLocalDay,
} from "@/features/shared/constants";

export async function markRitualComplete(ritualId: string) {
  const { user } = await verifySession();
  const today = getLocalDate();

  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) {
    return { error: "Ritual no encontrado" };
  }

  try {
    await db.insert(ritualLogs).values({
      ritualId,
      userId: user.id!,
      fecha: today,
      cumplido: true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { error: "Ya registrado hoy" };
    }
    throw e;
  }

  const newStreak = ritual.racha + 1;
  await db
    .update(rituals)
    .set({ racha: newStreak })
    .where(eq(rituals.id, ritualId));

  const hpGain =
    newStreak >= HP_STREAK_THRESHOLD ? HP_BONUS_STREAK : HP_PER_RITUAL;

  await db
    .update(users)
    .set({ hp: sql`LEAST(${users.hp} + ${hpGain}, ${HP_MAX})` })
    .where(eq(users.id, user.id!));

  const [updated] = await db
    .select({ hp: users.hp })
    .from(users)
    .where(eq(users.id, user.id!));

  revalidatePath("/rituals");
  revalidatePath("/");
  return { success: true, newHp: updated.hp, newStreak, hpGain };
}

export async function getTodayRituals(userId: string) {
  const today = getLocalDate();
  const todayDay = getLocalDay();

  const userRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, userId), eq(rituals.activo, true)));

  const todayRituals = userRituals.filter((r) => r.dias.includes(todayDay));

  const logs = await db
    .select()
    .from(ritualLogs)
    .where(and(eq(ritualLogs.userId, userId), eq(ritualLogs.fecha, today)));

  const completedIds = new Set(
    logs.filter((l) => l.cumplido).map((l) => l.ritualId)
  );

  return todayRituals.map((r) => ({
    ...r,
    completedToday: completedIds.has(r.id),
  }));
}
