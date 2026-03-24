import { verifySession } from "@/lib/dal";
import { SignOutButton } from "./_components/sign-out-button";

export default async function ElMundoPage() {
  const { user } = await verifySession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">El Mundo</h1>
      <p className="text-muted-foreground">Welcome, {user.email}</p>
      <SignOutButton />
    </div>
  );
}
