import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Resolve DB user UUID from session email. Use in API routes where verifySession() isn't available. */
export async function resolveUserId(
  session: { user?: { email?: string | null; id?: string | null } | null } | null
): Promise<string | null> {
  if (!session?.user?.email) return null;
  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email));
  return dbUser?.id ?? null;
}

export const verifySession = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Resolve DB user ID (session.user.id is the email in credentials provider)
  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, session.user.email!));

  return {
    user: {
      ...session.user,
      id: dbUser?.id ?? session.user.id,
    },
  };
});
