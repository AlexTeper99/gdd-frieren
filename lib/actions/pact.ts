"use server";

import { db } from "@/lib/db";
import { pacts, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { USER_TIMEZONE } from "@/lib/shared/constants";

function getCurrentSunday(): string {
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", {
    timeZone: USER_TIMEZONE,
    weekday: "short",
  });
  const dayIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(dayName);
  const diff = dayIndex === 0 ? 0 : -dayIndex;
  const sunday = new Date(now);
  sunday.setDate(sunday.getDate() + diff);

  return sunday.toLocaleDateString("en-CA", { timeZone: USER_TIMEZONE });
}

export async function getCurrentPact() {
  const semana = getCurrentSunday();

  const [pact] = await db
    .select()
    .from(pacts)
    .where(eq(pacts.semana, semana));

  return pact ?? null;
}

export async function submitPactAnswers(formData: FormData) {
  const { user } = await verifySession();
  const semana = getCurrentSunday();

  const answers = {
    obstaculos: (formData.get("obstaculos") as string)?.trim() ?? "",
    plan: (formData.get("plan") as string)?.trim() ?? "",
    apoyo: (formData.get("apoyo") as string)?.trim() ?? "",
    opcional: (formData.get("opcional") as string)?.trim() ?? "",
  };

  if (!answers.obstaculos || !answers.plan || !answers.apoyo) {
    return { error: "Completá al menos los primeros 3 campos" };
  }

  const allUsers = await db
    .select()
    .from(users)
    .orderBy(asc(users.id));

  const isPlayer1 = allUsers[0]?.id === user.id;

  const updateFields = isPlayer1
    ? { respuestasJ1: answers, firmadoJ1: true as const }
    : { respuestasJ2: answers, firmadoJ2: true as const };

  try {
    const [existingPact] = await db
      .select()
      .from(pacts)
      .where(eq(pacts.semana, semana));

    if (existingPact) {
      await db
        .update(pacts)
        .set(updateFields)
        .where(eq(pacts.id, existingPact.id));
    } else {
      await db.insert(pacts).values({
        semana,
        ...updateFields,
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      const [pact] = await db
        .select()
        .from(pacts)
        .where(eq(pacts.semana, semana));

      if (pact) {
        await db
          .update(pacts)
          .set(updateFields)
          .where(eq(pacts.id, pact.id));
      }
    } else {
      throw e;
    }
  }

  revalidatePath("/pact");
  return { success: true };
}
