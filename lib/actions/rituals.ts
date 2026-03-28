"use server";

import { db } from "@/lib/db";
import { rituals, ritualLogs, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const HP_PER_RITUAL = 5;
const HP_BONUS_STREAK = 7; // +7 instead of +5 if streak >= 7
const HP_STREAK_THRESHOLD = 7;
const HP_MAX = 100;

export async function markRitualComplete(ritualId: string) {
  const { user } = await verifySession();
  const today = new Date().toISOString().split("T")[0];

  // Check if already logged today
  const [existing] = await db
    .select()
    .from(ritualLogs)
    .where(
      and(
        eq(ritualLogs.ritualId, ritualId),
        eq(ritualLogs.fecha, today)
      )
    );

  if (existing) return { error: "Ya registrado hoy" };

  // Get ritual for streak
  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) return { error: "Ritual no encontrado" };

  // Log completion
  await db.insert(ritualLogs).values({
    ritualId,
    userId: user.id!,
    fecha: today,
    cumplido: true,
  });

  // Update streak
  const newStreak = ritual.racha + 1;
  await db
    .update(rituals)
    .set({ racha: newStreak })
    .where(eq(rituals.id, ritualId));

  // Update HP
  const hpGain = newStreak >= HP_STREAK_THRESHOLD ? HP_BONUS_STREAK : HP_PER_RITUAL;
  const [currentUser] = await db
    .select({ hp: users.hp })
    .from(users)
    .where(eq(users.id, user.id!));

  const newHp = Math.min(HP_MAX, (currentUser?.hp ?? 100) + hpGain);
  await db
    .update(users)
    .set({ hp: newHp })
    .where(eq(users.id, user.id!));

  revalidatePath("/rituals");
  revalidatePath("/");
  return { success: true, newHp, newStreak, hpGain };
}

export async function getTodayRituals(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const dayIndex = new Date().getDay(); // 0=dom, 1=lun...
  const dayMap = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const todayDay = dayMap[dayIndex];

  const userRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, userId), eq(rituals.activo, true)));

  // Filter by day of week
  const todayRituals = userRituals.filter((r) => r.dias.includes(todayDay));

  // Get today's logs
  const logs = await db
    .select()
    .from(ritualLogs)
    .where(and(eq(ritualLogs.userId, userId), eq(ritualLogs.fecha, today)));

  const completedIds = new Set(logs.filter((l) => l.cumplido).map((l) => l.ritualId));

  return todayRituals.map((r) => ({
    ...r,
    completedToday: completedIds.has(r.id),
  }));
}
