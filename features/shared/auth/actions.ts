"use server";

import { signOut } from "@/features/shared/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
