"use server";

import { db } from "@/lib/db";
import { pacts, users } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function getCurrentSunday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + diff);
  return sunday.toISOString().split("T")[0];
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
    obstaculos: formData.get("obstaculos") as string,
    plan: formData.get("plan") as string,
    apoyo: formData.get("apoyo") as string,
    opcional: formData.get("opcional") as string,
  };

  // Determine if player 1 or player 2
  const allUsers = await db.select().from(users);
  const isPlayer1 = allUsers[0]?.id === user.id;

  const [existingPact] = await db
    .select()
    .from(pacts)
    .where(eq(pacts.semana, semana));

  if (existingPact) {
    await db
      .update(pacts)
      .set(
        isPlayer1
          ? { respuestasJ1: answers, firmadoJ1: true }
          : { respuestasJ2: answers, firmadoJ2: true }
      )
      .where(eq(pacts.id, existingPact.id));
  } else {
    await db.insert(pacts).values({
      semana,
      ...(isPlayer1
        ? { respuestasJ1: answers, firmadoJ1: true }
        : { respuestasJ2: answers, firmadoJ2: true }),
    });
  }

  revalidatePath("/pact");
  return { success: true };
}
