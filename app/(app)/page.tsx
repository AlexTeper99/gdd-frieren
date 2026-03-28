import { verifySession } from "@/lib/dal";
import { db } from "@/lib/db";
import { users, rituals, ritualLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { HomeScreen } from "./home-screen";

export default async function HomePage() {
  const { user } = await verifySession();

  // Get both players
  const allUsers = await db.select().from(users);
  const me = allUsers.find((u) => u.id === user.id);
  const other = allUsers.find((u) => u.id !== user.id);

  if (!me?.onboardingCompleted) redirect("/onboarding");

  // Today's ritual count
  const today = new Date().toISOString().split("T")[0];
  const todayLogs = await db
    .select()
    .from(ritualLogs)
    .where(
      and(
        eq(ritualLogs.userId, user.id!),
        eq(ritualLogs.fecha, today),
        eq(ritualLogs.cumplido, true)
      )
    );

  const totalRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, user.id!), eq(rituals.activo, true)));

  return (
    <HomeScreen
      me={{
        id: me.id,
        nombre: me.nombrePersonaje!,
        arquetipo: me.arquetipo!,
        hp: me.hp,
      }}
      other={
        other
          ? {
              id: other.id,
              nombre: other.nombrePersonaje ?? "Esperando...",
              arquetipo: other.arquetipo ?? "paladin",
              hp: other.hp,
            }
          : null
      }
      ritualsCompleted={todayLogs.length}
      ritualsTotal={totalRituals.length}
      isSunday={new Date().getDay() === 0}
    />
  );
}
