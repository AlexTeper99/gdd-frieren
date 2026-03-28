import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const VALID_USERS = [
  { email: "alexteper99@gmail.com", name: "Alex" },
  { email: "daiana.goldberg@gmail.com", name: "Daiana" },
] as const;

const VALID_PASSWORD = process.env.AUTH_PASSWORD!;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (password !== VALID_PASSWORD) return null;

        const user = VALID_USERS.find((u) => u.email === email);
        if (!user) return null;

        return { id: user.email, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
});
