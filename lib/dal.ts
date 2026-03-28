import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Resolve DB user UUID from session. Use in API routes where verifySession() isn't available. */
export async function resolveUserId(
  session: { user?: { email?: string | null; id?: string | null } | null } | null
): Promise<string | null> {
  const lookupEmail = session?.user?.email ?? session?.user?.id;
  if (!lookupEmail) return null;
  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, lookupEmail));
  return dbUser?.id ?? null;
}

export const verifySession = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Resolve DB user ID
  // In credentials provider, session.user.id is set to the email.
  // Try email first, fall back to id (which is also email in our config).
  const lookupEmail = session.user.email ?? session.user.id;

  if (!lookupEmail) {
    redirect("/login");
  }

  const [dbUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, lookupEmail));

  if (!dbUser) {
    redirect("/login");
  }

  return {
    user: {
      ...session.user,
      id: dbUser.id,
    },
  };
});
