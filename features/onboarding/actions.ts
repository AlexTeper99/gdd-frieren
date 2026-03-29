"use server";

import { db } from "@/features/shared/db";
import { users, rituals } from "@/features/shared/db/schema";
import { verifySession } from "@/features/shared/auth/dal";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveCharacter(formData: FormData) {
  const { user } = await verifySession();

  const nombrePersonaje = formData.get("nombrePersonaje") as string;
  const arquetipo = formData.get("arquetipo") as
    | "paladin"
    | "mago"
    | "guerrero"
    | "sacerdote";
  const identidadTexto = formData.get("identidadTexto") as string;

  if (!nombrePersonaje || !arquetipo || !identidadTexto) {
    return { error: "Todos los campos son obligatorios" };
  }

  await db
    .update(users)
    .set({ nombrePersonaje, arquetipo, identidadTexto })
    .where(eq(users.id, user.id!));

  return { success: true };
}

export async function saveMissionAndRituals(
  misionCategoria: string,
  ritualsData: {
    descripcion: string;
    dias: string[];
    horaInicio: string;
    horaFin: string;
    lugar: string;
  }[]
) {
  const { user } = await verifySession();

  if (!misionCategoria) return { error: "Elegí una categoría" };
  if (ritualsData.length === 0) return { error: "Agregá al menos un ritual" };

  // Save mission category
  await db
    .update(users)
    .set({ misionCategoria })
    .where(eq(users.id, user.id!));

  // Save all rituals in batch
  await db.insert(rituals).values(
    ritualsData.map((r) => ({
      userId: user.id!,
      descripcion: r.descripcion,
      dias: r.dias,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      lugar: r.lugar,
    }))
  );

  revalidatePath("/onboarding");
  return { success: true };
}

export async function completeOnboarding() {
  const { user } = await verifySession();

  await db
    .update(users)
    .set({ onboardingCompleted: true })
    .where(eq(users.id, user.id!));

  revalidatePath("/");
  return { success: true };
}

export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));
  return profile ?? null;
}
