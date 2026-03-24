import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    Resend({
      from: "onboarding@resend.dev",
    }),
  ],
  callbacks: {
    signIn({ user }) {
      const allowed =
        process.env.AUTH_ALLOWED_EMAILS?.split(",").map((e) => e.trim()) ?? [];
      return allowed.includes(user.email ?? "");
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
});
