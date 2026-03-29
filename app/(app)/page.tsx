import { verifySession } from "@/features/shared/auth/dal";
import { db } from "@/features/shared/db";
import { users, rituals, ritualLogs } from "@/features/shared/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { HomeScreen } from "./home-screen";
import { getLocalDate, getLocalDay, getLocalDayIndex } from "@/features/shared/constants";

export default async function HomePage() {
  const { user } = await verifySession();

  // Get both players
  const allUsers = await db.select().from(users);
  const me = allUsers.find((u) => u.id === user.id);
  const other = allUsers.find((u) => u.id !== user.id);

  if (!me?.onboardingCompleted) redirect("/onboarding");

  // Today's ritual count (filtered by day of week)
  const today = getLocalDate();
  const todayDay = getLocalDay();

  const allActiveRituals = await db
    .select()
    .from(rituals)
    .where(and(eq(rituals.userId, user.id!), eq(rituals.activo, true)));

  const todayRituals = allActiveRituals.filter((r) => r.dias.includes(todayDay));

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
      ritualsTotal={todayRituals.length}
      isSunday={getLocalDayIndex() === 0}
    />
  );
}
