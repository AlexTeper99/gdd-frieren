"use server";

import { db } from "@/features/shared/db";
import { users, rituals, ritualLogs } from "@/features/shared/db/schema";
import { eq, and } from "drizzle-orm";
import {
  HP_PENALTY,
  HP_RESET_ON_ZERO,
  getYesterdayDate,
  getDayFromDate,
} from "@/features/shared/constants";

export async function penalizeUncompletedRituals(targetDate?: string) {
  const date = targetDate ?? getYesterdayDate();
  const day = getDayFromDate(date);

  const allUsers = await db.select().from(users);
  const results: { userId: string; status: string; hpLoss: number }[] = [];

  for (const user of allUsers) {
    if (!user.onboardingCompleted) continue;

    try {
      const userRituals = await db
        .select()
        .from(rituals)
        .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

      const targetDateEnd = new Date(date + "T23:59:59");
      const todayRituals = userRituals.filter(
        (r) => r.dias.includes(day) && r.createdAt <= targetDateEnd
      );

      const logs = await db
        .select()
        .from(ritualLogs)
        .where(
          and(eq(ritualLogs.userId, user.id), eq(ritualLogs.fecha, date))
        );

      const completedIds = new Set(
        logs.filter((l) => l.cumplido).map((l) => l.ritualId)
      );

      let hpLoss = 0;

      for (const ritual of todayRituals) {
        if (!completedIds.has(ritual.id)) {
          hpLoss += HP_PENALTY;

          await db
            .update(rituals)
            .set({ racha: 0 })
            .where(eq(rituals.id, ritual.id));

          try {
            await db.insert(ritualLogs).values({
              ritualId: ritual.id,
              userId: user.id,
              fecha: date,
              cumplido: false,
            });
          } catch {
            // Already logged (unique constraint) — skip
          }
        }
      }

      if (hpLoss > 0) {
        const newHpRaw = user.hp - hpLoss;

        if (newHpRaw <= 0) {
          await db
            .update(users)
            .set({ hp: HP_RESET_ON_ZERO })
            .where(eq(users.id, user.id));
        } else {
          await db
            .update(users)
            .set({ hp: newHpRaw })
            .where(eq(users.id, user.id));
        }
      }

      results.push({ userId: user.id, status: "success", hpLoss });
    } catch (error) {
      console.error(`[CRON] Penalty failed for user ${user.id}:`, error);
      results.push({ userId: user.id, status: "failed", hpLoss: 0 });
    }
  }

  return { success: true, date, results };
}
