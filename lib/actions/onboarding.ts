"use server";

import { db } from "@/lib/db";
import { users, rituals } from "@/lib/db/schema";
import { verifySession } from "@/lib/dal";
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

export async function saveMission(formData: FormData) {
  const { user } = await verifySession();

  const misionCategoria = formData.get("misionCategoria") as string;
  if (!misionCategoria) return { error: "Elegí una categoría" };

  await db
    .update(users)
    .set({ misionCategoria })
    .where(eq(users.id, user.id!));

  return { success: true };
}

export async function saveRitual(formData: FormData) {
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
