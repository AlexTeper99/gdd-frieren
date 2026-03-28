"use server";

import { signIn } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginWithCredentials(
  previousState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Completá email y contraseña" };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return null;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: "Email o contraseña incorrectos" };
  }
}
