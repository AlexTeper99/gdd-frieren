import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { users, rituals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "./onboarding-flow";

export default async function OnboardingPage() {
  const { user } = await verifySession();

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id!));

  if (dbUser?.onboardingCompleted) {
    redirect("/");
  }

  const userRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.userId, user.id!));

  return (
    <OnboardingFlow
      userId={user.id!}
      currentCharacter={{
        nombrePersonaje: dbUser?.nombrePersonaje ?? null,
        arquetipo: dbUser?.arquetipo ?? null,
        identidadTexto: dbUser?.identidadTexto ?? null,
        misionCategoria: dbUser?.misionCategoria ?? null,
      }}
      rituals={userRituals}
    />
  );
}
