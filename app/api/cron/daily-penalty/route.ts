import { penalizeUncompletedRituals } from "@/features/rituals/penalty";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await penalizeUncompletedRituals();
  return NextResponse.json(result);
}
