import { NextResponse } from "next/server";
import { auth } from "@/features/shared/auth";
import { resolveUserId } from "@/features/shared/auth/dal";
import { db } from "@/features/shared/db";
import { pushSubscriptions } from "@/features/shared/db/schema";

export async function POST(request: Request) {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await request.json();

  await db.insert(pushSubscriptions).values({
    userId,
    subscriptionJson: subscription,
  });

  return NextResponse.json({ success: true });
}
