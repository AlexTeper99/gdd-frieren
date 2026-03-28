"use server";

import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, and, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProfile(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const userRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.userId, userId));

  // Heatmap: last 28 days of ritual_logs
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const logs = await db
    .select()
    .from(ritualLogs)
    .where(
      and(
        eq(ritualLogs.userId, userId),
        gte(ritualLogs.fecha, fourWeeksAgo.toISOString().split("T")[0])
      )
    );

  // Build heatmap: date → count of completed / total
  const heatmap: Record<string, { completed: number; total: number }> = {};
  for (const log of logs) {
    const date = log.fecha;
    if (!heatmap[date]) heatmap[date] = { completed: 0, total: 0 };
    heatmap[date].total++;
    if (log.cumplido) heatmap[date].completed++;
  }

  return {
    user,
    rituals: userRituals,
    heatmap,
  };
}

export async function createRitual(formData: FormData) {
  const { user } = await verifySession();

  const descripcion = formData.get("descripcion") as string;
  const dias = formData.getAll("dias") as string[];
  const horaInicio = formData.get("horaInicio") as string;
  const horaFin = formData.get("horaFin") as string;
  const lugar = formData.get("lugar") as string;

  if (!descripcion || !dias.length || !horaInicio || !horaFin || !lugar) {
    return { error: "Todos los campos son obligatorios" };
  }

  await db.insert(rituals).values({
    userId: user.id!,
    descripcion,
    dias,
    horaInicio,
    horaFin,
    lugar,
  });

  revalidatePath("/profile/rituals");
  return { success: true };
}

export async function toggleRitualActive(ritualId: string) {
  const { user } = await verifySession();

  const [ritual] = await db
    .select()
    .from(rituals)
    .where(eq(rituals.id, ritualId));

  if (!ritual || ritual.userId !== user.id) return { error: "No encontrado" };

  await db
    .update(rituals)
    .set({ activo: !ritual.activo })
    .where(eq(rituals.id, ritualId));

  revalidatePath("/profile/rituals");
  return { success: true };
}
