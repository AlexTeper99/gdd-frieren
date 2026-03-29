import { NextResponse } from "next/server";
import { auth } from "@/features/shared/auth";
import { resolveUserId } from "@/features/shared/auth/dal";
import { getTodayRituals } from "@/features/rituals/actions";

export async function GET() {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  const rituals = await getTodayRituals(userId);
  const pending = rituals
    .filter((r) => !r.completedToday)
    .map((r) => ({ descripcion: r.descripcion, horaInicio: r.horaInicio }));

  return NextResponse.json(pending);
}
