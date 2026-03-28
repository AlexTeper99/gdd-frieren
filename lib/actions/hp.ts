"use server";

import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const HP_PENALTY = 10;
const HP_MIN = 0;
const HP_RESET_ON_ZERO = 30;

export async function penalizeUncompletedRituals() {
  const today = new Date().toISOString().split("T")[0];
  const dayIndex = new Date().getDay();
  const dayMap = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const todayDay = dayMap[dayIndex];

  const allUsers = await db.select().from(users);

  for (const user of allUsers) {
    if (!user.onboardingCompleted) continue;

    const userRituals = await db
      .select()
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

    const todayRituals = userRituals.filter((r) => r.dias.includes(todayDay));

    const logs = await db
      .select()
      .from(ritualLogs)
      .where(
        and(eq(ritualLogs.userId, user.id), eq(ritualLogs.fecha, today))
      );

    const completedIds = new Set(logs.map((l) => l.ritualId));

    let hpLoss = 0;

    for (const ritual of todayRituals) {
      if (!completedIds.has(ritual.id)) {
        // Not completed — penalize
        hpLoss += HP_PENALTY;

        // Reset streak
        await db
          .update(rituals)
          .set({ racha: 0 })
          .where(eq(rituals.id, ritual.id));

        // Log as not completed
        await db.insert(ritualLogs).values({
          ritualId: ritual.id,
          userId: user.id,
          fecha: today,
          cumplido: false,
        });
      }
    }

    if (hpLoss > 0) {
      let newHp = Math.max(HP_MIN, user.hp - hpLoss);

      // HP 0 event: reset to 30
      if (newHp <= 0) {
        newHp = HP_RESET_ON_ZERO;
      }

      await db
        .update(users)
        .set({ hp: newHp })
        .where(eq(users.id, user.id));
    }
  }

  return { success: true, date: today };
}
