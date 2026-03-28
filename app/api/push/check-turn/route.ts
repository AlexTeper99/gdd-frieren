import { NextResponse } from "next/server";
import { auth } from "@/features/shared/auth";
import { resolveUserId } from "@/features/shared/auth/dal";
import { getStoryState } from "@/features/story/actions";

export async function GET() {
  const session = await auth();
  const userId = await resolveUserId(session);
  if (!userId) {
    return NextResponse.json({ isMyTurn: false }, { status: 401 });
  }

  const state = await getStoryState(userId);
  return NextResponse.json({ isMyTurn: state.isMyTurn });
}
