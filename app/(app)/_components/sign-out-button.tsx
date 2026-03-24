import { signOut } from "@/lib/auth";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="text-muted-foreground text-sm underline"
      >
        Sign out
      </button>
    </form>
  );
}
