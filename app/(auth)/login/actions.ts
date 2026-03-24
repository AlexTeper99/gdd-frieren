"use server";

import { signIn } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { getCopy } from "@/lib/copy";
import { VALIDATION_EMAIL } from "@/lib/copy/errors";

export async function loginWithEmail(
  previousState: { error: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: getCopy(VALIDATION_EMAIL) };
  }

  try {
    await signIn("resend", { email, redirectTo: "/" });
    return null;
  } catch (error) {
    // Auth.js signIn triggers a redirect on success — rethrow it
    if (isRedirectError(error)) {
      throw error;
    }
    return { error: "Could not send magic link. Is this email allowed?" };
  }
}
