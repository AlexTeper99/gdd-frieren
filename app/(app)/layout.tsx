import { verifySession } from "@/lib/dal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real session validation — redirects to /login if invalid
  await verifySession();

  return <>{children}</>;
}
