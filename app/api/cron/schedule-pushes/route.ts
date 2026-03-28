import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, rituals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendPushToUser } from "@/lib/push/send";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, "0");
  const currentMinute = now.getMinutes();
  // Round to nearest 30-min window
  const minuteWindow = currentMinute < 30 ? "00" : "30";
  const timeWindow = `${currentHour}:${minuteWindow}`;

  const dayIndex = now.getDay();
  const dayMap = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
  const todayDay = dayMap[dayIndex];

  const allUsers = await db.select().from(users);

  let sent = 0;

  for (const user of allUsers) {
    if (!user.onboardingCompleted) continue;

    const userRituals = await db
      .select()
      .from(rituals)
      .where(and(eq(rituals.userId, user.id), eq(rituals.activo, true)));

    for (const ritual of userRituals) {
      if (!ritual.dias.includes(todayDay)) continue;

      // Check if ritual hora_inicio falls in current 30-min window
      const [ritualHour, ritualMin] = ritual.horaInicio.split(":");
      const ritualTime = `${ritualHour}:${parseInt(ritualMin) < 30 ? "00" : "30"}`;

      if (ritualTime === timeWindow) {
        await sendPushToUser(user.id, {
          title: "\u{1F525} Ritual",
          body: ritual.descripcion,
          url: "/rituals",
        });
        sent++;
      }
    }
  }

  // Sunday pact reminder at 10:00
  if (dayIndex === 0 && timeWindow === "10:00") {
    for (const user of allUsers) {
      await sendPushToUser(user.id, {
        title: "\u{1F4DC} Pacto Semanal",
        body: "Es domingo \u2014 complet\u00E1 tu pacto semanal",
        url: "/pact",
      });
    }
  }

  return NextResponse.json({ sent, timeWindow });
}
