import { verifySession } from "@/lib/dal";
import { PushRegistration } from "./_components/push-registration";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real session validation — redirects to /login if invalid
  await verifySession();

  return (
    <>
      <PushRegistration />
      {children}
    </>
  );
}
